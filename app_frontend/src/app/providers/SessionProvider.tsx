import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { buildPersonaState } from '@/mocks/personas';
import { clearAppStorage, readStorage, writeStorage } from '@/shared/lib/storage';
import type {
  IntegrationState,
  NotificationSettings,
  Persona,
  PrivacySettings,
  SubscriptionState,
  UserProfile,
} from '@/types';

/**
 * Состояние демо-сессии. Заменяет и авторизацию, и хранилище данных: всё
 * держится в памяти и в localStorage, чтобы прототип переживал перезагрузку.
 */
interface SessionSnapshot {
  authenticated: boolean;
  persona: Persona;
  user: UserProfile;
  integrations: IntegrationState;
  subscription: SubscriptionState;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  mutedConversationIds: string[];
  needsOnboarding: boolean;
}

interface SessionContextValue extends SessionSnapshot {
  isPro: boolean;
  login: (persona: Persona) => void;
  logout: () => void;
  switchPersona: (persona: Persona) => void;
  resetDemo: () => void;
  updateUser: (patch: Partial<UserProfile>) => void;
  updateIntegrations: (patch: Partial<IntegrationState>) => void;
  updateNotifications: (patch: Partial<NotificationSettings>) => void;
  updatePrivacy: (patch: Partial<PrivacySettings>) => void;
  setSubscription: (next: SubscriptionState) => void;
  completeOnboarding: () => void;
  toggleConversationMute: (conversationId: string) => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  /** Отключение WakaTime каскадом выключает лидерборд и AI-агента. */
  disconnectWakatime: () => void;
  connectWakatime: (apiKeyMask: string) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

const STORAGE_KEY = 'session';

function createSnapshot(persona: Persona, authenticated: boolean): SessionSnapshot {
  const state = buildPersonaState(persona);
  return {
    authenticated,
    persona,
    user: state.user,
    integrations: state.integrations,
    subscription: state.subscription,
    notifications: state.notifications,
    privacy: state.privacy,
    mutedConversationIds: persona === 'new' ? [] : ['c-3'],
    needsOnboarding: state.needsOnboarding,
  };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<SessionSnapshot>(() =>
    readStorage<SessionSnapshot>(STORAGE_KEY, createSnapshot('free', false)),
  );

  // Любое изменение состояния переживает перезагрузку — иначе прототип
  // невозможно показывать, всё сбрасывается на первом же F5.
  useEffect(() => {
    writeStorage(STORAGE_KEY, snapshot);
  }, [snapshot]);

  const patch = useCallback((updater: (current: SessionSnapshot) => SessionSnapshot) => {
    setSnapshot(updater);
  }, []);

  const login = useCallback(
    (persona: Persona) => setSnapshot(createSnapshot(persona, true)),
    [],
  );

  const logout = useCallback(
    () => setSnapshot((current) => ({ ...current, authenticated: false })),
    [],
  );

  const switchPersona = useCallback(
    (persona: Persona) => setSnapshot((current) => createSnapshot(persona, current.authenticated)),
    [],
  );

  const resetDemo = useCallback(() => {
    clearAppStorage();
    setSnapshot(createSnapshot('free', false));
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      ...snapshot,
      isPro: snapshot.subscription.plan === 'pro',
      login,
      logout,
      switchPersona,
      resetDemo,

      updateUser: (userPatch) =>
        patch((current) => ({ ...current, user: { ...current.user, ...userPatch } })),

      updateIntegrations: (integrationsPatch) =>
        patch((current) => ({
          ...current,
          integrations: { ...current.integrations, ...integrationsPatch },
        })),

      updateNotifications: (notificationsPatch) =>
        patch((current) => ({
          ...current,
          notifications: { ...current.notifications, ...notificationsPatch },
        })),

      updatePrivacy: (privacyPatch) =>
        patch((current) => ({ ...current, privacy: { ...current.privacy, ...privacyPatch } })),

      setSubscription: (next) =>
        patch((current) => ({
          ...current,
          subscription: next,
          user: { ...current.user, plan: next.plan },
          integrations: {
            ...current.integrations,
            aiAgent: { enabled: next.plan === 'pro' },
          },
        })),

      completeOnboarding: () => patch((current) => ({ ...current, needsOnboarding: false })),

      toggleConversationMute: (conversationId) =>
        patch((current) => ({
          ...current,
          mutedConversationIds: current.mutedConversationIds.includes(conversationId)
            ? current.mutedConversationIds.filter((id) => id !== conversationId)
            : [...current.mutedConversationIds, conversationId],
        })),

      blockUser: (userId) =>
        patch((current) => ({
          ...current,
          privacy: {
            ...current.privacy,
            blockedUserIds: current.privacy.blockedUserIds.includes(userId)
              ? current.privacy.blockedUserIds
              : [...current.privacy.blockedUserIds, userId],
          },
        })),

      unblockUser: (userId) =>
        patch((current) => ({
          ...current,
          privacy: {
            ...current.privacy,
            blockedUserIds: current.privacy.blockedUserIds.filter((id) => id !== userId),
          },
        })),

      connectWakatime: (apiKeyMask) =>
        patch((current) => ({
          ...current,
          integrations: {
            ...current.integrations,
            wakatime: {
              status: 'connected',
              connectedAt: new Date().toISOString(),
              lastSyncedAt: new Date().toISOString(),
              apiKeyMask,
            },
          },
        })),

      // Лидерборд питается данными WakaTime, поэтому без неё он бессмысленен.
      disconnectWakatime: () =>
        patch((current) => ({
          ...current,
          integrations: {
            ...current.integrations,
            wakatime: { status: 'disconnected' },
            leaderboard: { participating: false },
            trackedTags: [],
          },
        })),
    }),
    [snapshot, login, logout, switchPersona, resetDemo, patch],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession должен вызываться внутри SessionProvider');
  return context;
}

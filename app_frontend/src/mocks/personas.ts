import type {
  IntegrationState,
  NotificationSettings,
  Persona,
  PrivacySettings,
  SubscriptionState,
  UserProfile,
} from '@/types';

import { SPECIALTY_PRESETS } from './tags';
import { CURRENT_USER_BASE } from './users';

export interface PersonaState {
  user: UserProfile;
  integrations: IntegrationState;
  subscription: SubscriptionState;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  /** Онбординг ещё не пройден — показываем модалку специальности и тур. */
  needsOnboarding: boolean;
}

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  newMessages: { email: false, inApp: true },
  aiReports: { email: true, inApp: true },
  rankChanges: { email: false, inApp: true },
  seasonEnd: { email: true, inApp: true },
  globalQuiet: false,
  quietFrom: '23:00',
  quietTo: '09:00',
};

const DEFAULT_PRIVACY: PrivacySettings = {
  publicProfile: true,
  showLocation: true,
  whoCanMessage: 'everyone',
  blockedUserIds: ['u5'],
};

export function buildPersonaState(persona: Persona): PersonaState {
  if (persona === 'new') {
    return {
      user: {
        ...CURRENT_USER_BASE,
        username: 'newcomer',
        email: 'new@mywayis.com',
        firstName: undefined,
        lastName: undefined,
        specialty: null,
        specialtyDescription: undefined,
        joinedAt: new Date().toISOString(),
        plan: 'free',
        languages: [],
      },
      integrations: {
        wakatime: { status: 'disconnected' },
        leaderboard: { participating: false },
        aiAgent: { enabled: false },
        trackedTags: [],
      },
      subscription: { plan: 'free', payments: [] },
      notifications: DEFAULT_NOTIFICATIONS,
      privacy: { ...DEFAULT_PRIVACY, blockedUserIds: [] },
      needsOnboarding: true,
    };
  }

  const isPro = persona === 'pro';

  return {
    user: { ...CURRENT_USER_BASE, plan: isPro ? 'pro' : 'free' },
    integrations: {
      wakatime: {
        status: 'connected',
        connectedAt: '2026-03-06T10:30:00Z',
        lastSyncedAt: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
        apiKeyMask: 'waka_••••••••••••••••••••3f7a',
      },
      leaderboard: { participating: true },
      aiAgent: { enabled: isPro },
      trackedTags: [...SPECIALTY_PRESETS.backend, 'typescript', 'react'],
    },
    subscription: isPro
      ? {
          plan: 'pro',
          renewsAt: '2026-09-06T00:00:00Z',
          provider: 'yookassa',
          payments: [
            {
              id: 'p-3',
              date: '2026-08-06T09:12:00Z',
              amount: 490,
              period: 'month',
              status: 'paid',
              provider: 'yookassa',
            },
            {
              id: 'p-2',
              date: '2026-07-06T09:08:00Z',
              amount: 490,
              period: 'month',
              status: 'paid',
              provider: 'yookassa',
            },
            {
              id: 'p-1',
              date: '2026-06-06T09:15:00Z',
              amount: 490,
              period: 'month',
              status: 'paid',
              provider: 'yookassa',
            },
          ],
        }
      : { plan: 'free', payments: [] },
    notifications: DEFAULT_NOTIFICATIONS,
    privacy: DEFAULT_PRIVACY,
    needsOnboarding: false,
  };
}

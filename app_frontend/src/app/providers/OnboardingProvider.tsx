import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { readStorage, writeStorage } from '@/shared/lib/storage';

import { useSession } from './SessionProvider';

/**
 * Онбординг состоит из трёх фаз, идущих строго по порядку:
 *   specialty → invite → tour → done
 * Прогресс лежит в localStorage: перезагрузка не должна отбрасывать человека
 * в начало тура.
 */
export type OnboardingPhase = 'idle' | 'specialty' | 'invite' | 'tour' | 'done';

/**
 * Якоря перечислены по убыванию точности: берём первый найденный в DOM.
 * У нового пользователя дашборд пустой и KPI-карточек нет — тогда шаг
 * подсвечивает всю область контента, а не залипает на отсутствующем узле.
 */
export const TOUR_STEPS = [
  { id: 'nav', anchors: ['nav'] },
  { id: 'dashboard', anchors: ['dashboard-kpi', 'content'] },
  { id: 'integrations', anchors: ['nav-integrations'] },
  { id: 'leaderboard', anchors: ['nav-leaderboard'] },
  { id: 'messages', anchors: ['nav-messages'] },
  { id: 'settings', anchors: ['nav-settings'] },
] as const;

interface OnboardingContextValue {
  phase: OnboardingPhase;
  tourStep: number;
  totalSteps: number;
  finishSpecialty: () => void;
  startTour: () => void;
  skipTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  finishTour: () => void;
  restartTour: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

const STORAGE_KEY = 'onboarding.v1';

interface StoredProgress {
  phase: OnboardingPhase;
  tourStep: number;
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { authenticated, needsOnboarding, user, completeOnboarding } = useSession();

  const [progress, setProgress] = useState<StoredProgress>(() =>
    readStorage<StoredProgress>(STORAGE_KEY, { phase: 'idle', tourStep: 0 }),
  );

  useEffect(() => {
    writeStorage(STORAGE_KEY, progress);
  }, [progress]);

  /**
   * Стартовую фазу выводим прямо на рендере, а не проставляем эффектом:
   * она однозначно определяется флагом needsOnboarding и тем, задана ли
   * специальность. В хранилище попадает только то, что пользователь уже
   * прошёл своими действиями.
   */
  const phase: OnboardingPhase = !authenticated
    ? 'idle'
    : needsOnboarding && (progress.phase === 'idle' || progress.phase === 'done')
      ? user.specialty
        ? 'invite'
        : 'specialty'
      : progress.phase;

  const value = useMemo<OnboardingContextValue>(() => {
    const finish = () => {
      setProgress({ phase: 'done', tourStep: 0 });
      completeOnboarding();
    };

    return {
      phase,
      tourStep: progress.tourStep,
      totalSteps: TOUR_STEPS.length,
      finishSpecialty: () => setProgress({ phase: 'invite', tourStep: 0 }),
      startTour: () => setProgress({ phase: 'tour', tourStep: 0 }),
      skipTour: finish,
      finishTour: finish,
      nextStep: () =>
        setProgress((current) => {
          if (current.tourStep >= TOUR_STEPS.length - 1) {
            completeOnboarding();
            return { phase: 'done', tourStep: 0 };
          }
          return { ...current, tourStep: current.tourStep + 1 };
        }),
      prevStep: () =>
        setProgress((current) => ({
          ...current,
          tourStep: Math.max(0, current.tourStep - 1),
        })),
      restartTour: () => setProgress({ phase: 'tour', tourStep: 0 }),
    };
  }, [phase, progress, completeOnboarding]);

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboarding должен вызываться внутри OnboardingProvider');
  return context;
}

export const useOnboardingSafe = () => useContext(OnboardingContext);

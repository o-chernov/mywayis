import { useTranslation } from 'react-i18next';

import { useOnboarding } from '@/app/providers/OnboardingProvider';
import { SparkleIcon } from '@/shared/icons';
import { Button, Modal } from '@/shared/ui';

import { ProductTour } from './ProductTour';
import { SpecialtyModal } from './SpecialtyModal';

/**
 * Дирижёр онбординга: специальность → приглашение в тур → тур.
 * Живёт над роутером, поэтому переживает переходы между страницами.
 */
export function OnboardingFlow() {
  const { t } = useTranslation(['onboarding', 'common']);
  const { phase, finishSpecialty, startTour, skipTour } = useOnboarding();

  if (phase === 'specialty') {
    return <SpecialtyModal onDone={finishSpecialty} />;
  }

  if (phase === 'invite') {
    return (
      <Modal
        open
        onClose={skipTour}
        size="sm"
        icon={<SparkleIcon width={18} height={18} />}
        title={t('onboarding:tourInvite.title')}
        subtitle={t('onboarding:tourInvite.text')}
        footer={
          <>
            {/* Пропуск не должен выглядеть наказанием — кнопки равнозначны. */}
            <Button variant="secondary" onClick={skipTour}>
              {t('onboarding:tourInvite.skip')}
            </Button>
            <Button variant="primary" onClick={startTour}>
              {t('onboarding:tourInvite.start')}
            </Button>
          </>
        }
      />
    );
  }

  if (phase === 'tour') {
    return <ProductTour />;
  }

  return null;
}

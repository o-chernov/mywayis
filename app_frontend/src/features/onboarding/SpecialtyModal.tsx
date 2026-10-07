import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/app/providers/SessionProvider';
import { UserIcon } from '@/shared/icons';
import { Button, Field, Modal, Textarea } from '@/shared/ui';
import type { SpecialtyId } from '@/types';

import { SpecialtySelect } from './SpecialtySelect';

const MAX_DESCRIPTION = 280;

/**
 * Первый обязательный шаг после регистрации. Модалка намеренно не закрывается:
 * без специальности мы не можем ни подобрать теги, ни поставить человека в
 * нужный срез лидерборда.
 */
export function SpecialtyModal({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation(['onboarding', 'common']);
  const { user, updateUser } = useSession();

  const [specialty, setSpecialty] = useState<SpecialtyId | ''>(user.specialty ?? '');
  const [description, setDescription] = useState(user.specialtyDescription ?? '');

  function submit() {
    if (!specialty) return;
    updateUser({
      specialty,
      specialtyDescription: description.trim() || undefined,
    });
    onDone();
  }

  return (
    <Modal
      open
      mandatory
      onClose={() => undefined}
      size="md"
      icon={<UserIcon width={18} height={18} />}
      title={t('onboarding:specialty.title')}
      subtitle={t('onboarding:specialty.subtitle')}
      footer={
        <Button variant="primary" size="lg" disabled={!specialty} onClick={submit}>
          {t('onboarding:specialty.submit')}
        </Button>
      }
    >
      <div style={{ display: 'grid', gap: 'var(--space-5)' }}>
        <Field label={t('common:specialty.label')}>
          {(props) => <SpecialtySelect value={specialty} onChange={setSpecialty} {...props} />}
        </Field>

        <Field
          label={t('onboarding:specialty.descriptionLabel')}
          optionalLabel={t('onboarding:specialty.descriptionOptional')}
          aside={t('onboarding:specialty.counter', {
            current: description.length,
            max: MAX_DESCRIPTION,
          })}
          hint={t('onboarding:specialty.descriptionHint')}
        >
          {(props) => (
            <Textarea
              {...props}
              value={description}
              maxLength={MAX_DESCRIPTION}
              placeholder={t('onboarding:specialty.descriptionPlaceholder')}
              onChange={(event) => setDescription(event.target.value)}
            />
          )}
        </Field>
      </div>
    </Modal>
  );
}

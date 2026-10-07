import { useTranslation } from 'react-i18next';

import { Select } from '@/shared/ui';
import type { SpecialtyId } from '@/types';

/** Группы специальностей — порядок фиксирован, подписи переводятся. */
export const SPECIALTY_GROUPS: Array<{ group: string; items: SpecialtyId[] }> = [
  { group: 'development', items: ['backend', 'frontend', 'fullstack', 'mobile'] },
  { group: 'infrastructure', items: ['devops', 'data', 'qa'] },
  { group: 'other', items: ['design', 'other'] },
];

export const ALL_SPECIALTIES: SpecialtyId[] = SPECIALTY_GROUPS.flatMap((entry) => entry.items);

interface SpecialtySelectProps {
  value: SpecialtyId | '';
  onChange: (value: SpecialtyId | '') => void;
  id?: string;
  invalid?: boolean;
  'aria-describedby'?: string;
}

export function SpecialtySelect({ value, onChange, ...rest }: SpecialtySelectProps) {
  const { t } = useTranslation('common');

  return (
    <Select
      value={value}
      onChange={(event) => onChange(event.target.value as SpecialtyId | '')}
      {...rest}
    >
      <option value="">{t('specialty.placeholder')}</option>
      {SPECIALTY_GROUPS.map((entry) => (
        <optgroup key={entry.group} label={t(`specialty.groups.${entry.group}`)}>
          {entry.items.map((item) => (
            <option key={item} value={item}>
              {t(`specialty.${item}`)}
            </option>
          ))}
        </optgroup>
      ))}
    </Select>
  );
}

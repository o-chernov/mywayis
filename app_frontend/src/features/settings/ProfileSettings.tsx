import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/app/providers/SessionProvider';
import { useToast } from '@/app/providers/ToastProvider';
import { SpecialtySelect } from '@/features/onboarding/SpecialtySelect';
import { COUNTRIES, countryName } from '@/mocks/leaderboard';
import { Avatar, Button, Card, Field, Input, Select, Textarea } from '@/shared/ui';
import type { SpecialtyId } from '@/types';

import styles from './Settings.module.css';

const MAX_DESCRIPTION = 280;

/** Часовой пояс браузера — подставляем как значение по умолчанию. */
const DETECTED_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

const TIMEZONES = [
  'Europe/Kaliningrad',
  'Europe/Moscow',
  'Europe/Samara',
  'Asia/Yekaterinburg',
  'Asia/Omsk',
  'Asia/Novosibirsk',
  'Asia/Krasnoyarsk',
  'Asia/Irkutsk',
  'Asia/Yakutsk',
  'Asia/Vladivostok',
  'Asia/Almaty',
  'Asia/Yerevan',
  'Europe/Minsk',
];

export function ProfileSettings() {
  const { t } = useTranslation(['settings', 'common']);
  const { user, updateUser } = useSession();
  const { toast } = useToast();

  const [form, setForm] = useState({
    username: user.username,
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    specialty: (user.specialty ?? '') as SpecialtyId | '',
    description: user.specialtyDescription ?? '',
    country: user.country ?? 'RU',
    city: user.city ?? '',
    timezone: user.timezone,
  });

  const dirty =
    form.username !== user.username ||
    form.firstName !== (user.firstName ?? '') ||
    form.lastName !== (user.lastName ?? '') ||
    form.specialty !== (user.specialty ?? '') ||
    form.description !== (user.specialtyDescription ?? '') ||
    form.country !== (user.country ?? 'RU') ||
    form.city !== (user.city ?? '') ||
    form.timezone !== user.timezone;

  const usernameError = !form.username.trim() ? t('settings:common.required') : undefined;
  const specialtyError = !form.specialty ? t('settings:common.required') : undefined;
  const canSave = dirty && !usernameError && !specialtyError;

  function save() {
    updateUser({
      username: form.username.trim(),
      firstName: form.firstName.trim() || undefined,
      lastName: form.lastName.trim() || undefined,
      specialty: form.specialty as SpecialtyId,
      specialtyDescription: form.description.trim() || undefined,
      country: form.country,
      city: form.city.trim() || undefined,
      timezone: form.timezone,
    });
    toast(t('settings:common.saved'));
  }

  return (
    <Card title={t('settings:profile.title')} subtitle={t('settings:profile.hint')}>
      <div className={styles.section}>
        <div className={styles.avatarRow}>
          <Avatar username={form.username} color={user.avatarColor} size="xl" />
          <div className={styles.avatarActions}>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Button size="sm" onClick={() => toast(t('settings:profile.avatarUpload'), { tone: 'info' })}>
                {t('settings:profile.avatarUpload')}
              </Button>
              <Button variant="ghost" size="sm">
                {t('settings:profile.avatarRemove')}
              </Button>
            </div>
            <span className={styles.avatarHint}>{t('settings:profile.avatarHint')}</span>
          </div>
        </div>

        <div className={styles.divider} />

        <Field
          label={t('settings:profile.username')}
          hint={t('settings:profile.usernameHint')}
          error={usernameError}
        >
          {(props) => (
            <Input
              {...props}
              value={form.username}
              invalid={Boolean(usernameError)}
              onChange={(event) => setForm({ ...form, username: event.target.value })}
            />
          )}
        </Field>

        <div className={styles.row}>
          <Field label={t('settings:profile.firstName')}>
            {(props) => (
              <Input
                {...props}
                value={form.firstName}
                onChange={(event) => setForm({ ...form, firstName: event.target.value })}
              />
            )}
          </Field>
          <Field label={t('settings:profile.lastName')}>
            {(props) => (
              <Input
                {...props}
                value={form.lastName}
                onChange={(event) => setForm({ ...form, lastName: event.target.value })}
              />
            )}
          </Field>
        </div>

        <Field label={t('common:specialty.label')} error={specialtyError}>
          {(props) => (
            <SpecialtySelect
              {...props}
              value={form.specialty}
              invalid={Boolean(specialtyError)}
              onChange={(value) => setForm({ ...form, specialty: value })}
            />
          )}
        </Field>

        <Field
          label={t('settings:profile.description')}
          optionalLabel={t('common:actions.add').toLowerCase()}
          hint={t('settings:profile.descriptionHint')}
          aside={`${form.description.length} / ${MAX_DESCRIPTION}`}
        >
          {(props) => (
            <Textarea
              {...props}
              value={form.description}
              maxLength={MAX_DESCRIPTION}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          )}
        </Field>

        <div className={styles.divider} />

        <div className={styles.rowThree}>
          <Field label={t('settings:profile.country')}>
            {(props) => (
              <Select
                {...props}
                value={form.country}
                onChange={(event) => setForm({ ...form, country: event.target.value })}
              >
                {COUNTRIES.map((code) => (
                  <option key={code} value={code}>
                    {countryName(code, 'ru')}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field label={t('settings:profile.city')}>
            {(props) => (
              <Input
                {...props}
                value={form.city}
                onChange={(event) => setForm({ ...form, city: event.target.value })}
              />
            )}
          </Field>

          <Field
            label={t('settings:profile.timezone')}
            hint={t('settings:profile.timezoneAuto', { zone: DETECTED_TIMEZONE })}
          >
            {(props) => (
              <Select
                {...props}
                value={form.timezone}
                onChange={(event) => setForm({ ...form, timezone: event.target.value })}
              >
                {/* Определённый браузером пояс держим в списке, даже если его нет в нашем наборе. */}
                {Array.from(new Set([DETECTED_TIMEZONE, ...TIMEZONES])).map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>

        <div className={styles.footer}>
          {dirty && <span className={styles.dirtyHint}>{t('settings:common.unsaved')}</span>}
          <Button variant="primary" disabled={!canSave} onClick={save}>
            {t('common:actions.save')}
          </Button>
        </div>
      </div>
    </Card>
  );
}

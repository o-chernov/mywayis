import { useTranslation } from 'react-i18next';

import { useOnboarding } from '@/app/providers/OnboardingProvider';
import { useTheme, type ThemeMode } from '@/app/providers/ThemeProvider';
import { readStorage, writeStorage } from '@/shared/lib/storage';
import { Button, Card, Field, SegmentedControl, Select } from '@/shared/ui';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n';

import styles from './Settings.module.css';

export function AppearanceSettings() {
  const { t, i18n } = useTranslation(['settings', 'common', 'onboarding']);
  const { mode, setMode } = useTheme();
  const { restartTour } = useOnboarding();

  // Формат времени и первый день недели пока только сохраняются — они
  // пригодятся, когда появятся настоящие настройки отображения.
  const hour12 = readStorage<boolean>('prefs.hour12', false);
  const weekStart = readStorage<'monday' | 'sunday'>('prefs.weekStart', 'monday');

  return (
    <Card title={t('settings:appearance.title')}>
      <div className={styles.section}>
        <Field label={t('settings:appearance.theme')}>
          {() => (
            <SegmentedControl<ThemeMode>
              ariaLabel={t('settings:appearance.theme')}
              value={mode}
              onChange={setMode}
              options={[
                { value: 'system', label: t('common:theme.system') },
                { value: 'dark', label: t('common:theme.dark') },
                { value: 'light', label: t('common:theme.light') },
              ]}
            />
          )}
        </Field>

        <div className={styles.divider} />

        <Field label={t('settings:appearance.language')}>
          {(props) => (
            <Select
              {...props}
              value={i18n.language.startsWith('en') ? 'en' : 'ru'}
              onChange={(event) => void i18n.changeLanguage(event.target.value)}
            >
              {SUPPORTED_LANGUAGES.map((language: SupportedLanguage) => (
                <option key={language} value={language}>
                  {t(`common:language.${language}`)}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <div className={styles.row}>
          <Field label={t('settings:appearance.timeFormat')}>
            {(props) => (
              <Select
                {...props}
                defaultValue={hour12 ? '12' : '24'}
                onChange={(event) => writeStorage('prefs.hour12', event.target.value === '12')}
              >
                <option value="24">{t('settings:appearance.timeFormat24')}</option>
                <option value="12">{t('settings:appearance.timeFormat12')}</option>
              </Select>
            )}
          </Field>

          <Field label={t('settings:appearance.weekStart')}>
            {(props) => (
              <Select
                {...props}
                defaultValue={weekStart}
                onChange={(event) => writeStorage('prefs.weekStart', event.target.value)}
              >
                <option value="monday">{t('settings:appearance.weekStartMonday')}</option>
                <option value="sunday">{t('settings:appearance.weekStartSunday')}</option>
              </Select>
            )}
          </Field>
        </div>

        <div className={styles.divider} />

        <div className={styles.dangerRow}>
          <span className={styles.dangerText}>
            <span className={styles.dangerTitle}>{t('settings:appearance.tour')}</span>
            <span className={styles.dangerHint}>{t('onboarding:restart.hint')}</span>
          </span>
          <span className={styles.listAction}>
            <Button onClick={restartTour}>{t('onboarding:restart.label')}</Button>
          </span>
        </div>
      </div>
    </Card>
  );
}

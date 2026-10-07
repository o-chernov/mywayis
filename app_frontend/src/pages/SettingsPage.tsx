import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import { AccountSettings } from '@/features/settings/AccountSettings';
import { AppearanceSettings } from '@/features/settings/AppearanceSettings';
import { NotificationSettings } from '@/features/settings/NotificationSettings';
import { PrivacySettings } from '@/features/settings/PrivacySettings';
import { ProfileSettings } from '@/features/settings/ProfileSettings';
import { SubscriptionSettings } from '@/features/settings/SubscriptionSettings';
import { PageHeader } from '@/layouts/PageHeader/PageHeader';
import { Tabs } from '@/shared/ui';

import styles from '@/features/settings/Settings.module.css';

const TABS = [
  'profile',
  'account',
  'notifications',
  'privacy',
  'subscription',
  'appearance',
] as const;

type TabId = (typeof TABS)[number];

export function SettingsPage() {
  const { t } = useTranslation('settings');
  const { tab } = useParams();
  const navigate = useNavigate();

  // Вкладка живёт в URL — на конкретный раздел можно дать ссылку.
  const active: TabId = TABS.includes(tab as TabId) ? (tab as TabId) : 'profile';

  return (
    <>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />

      <div className={styles.layout}>
        <div className={styles.nav}>
          <Tabs<TabId>
            orientation="vertical"
            ariaLabel={t('title')}
            value={active}
            onChange={(value) => navigate(`/settings/${value}`)}
            items={TABS.map((id) => ({ value: id, label: t(`tabs.${id}`) }))}
          />
        </div>

        <div className={styles.panel}>
          {active === 'profile' && <ProfileSettings />}
          {active === 'account' && <AccountSettings />}
          {active === 'notifications' && <NotificationSettings />}
          {active === 'privacy' && <PrivacySettings />}
          {active === 'subscription' && <SubscriptionSettings />}
          {active === 'appearance' && <AppearanceSettings />}
        </div>
      </div>
    </>
  );
}

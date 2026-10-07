import { useTranslation } from 'react-i18next';

import { useSession } from '@/app/providers/SessionProvider';
import { useToast } from '@/app/providers/ToastProvider';
import { Card, Checkbox, Field, Input, Switch } from '@/shared/ui';
import type { NotificationSettings as Settings } from '@/types';

import styles from './Settings.module.css';

type EventKey = 'newMessages' | 'aiReports' | 'rankChanges' | 'seasonEnd';

const EVENTS: EventKey[] = ['newMessages', 'aiReports', 'rankChanges', 'seasonEnd'];

export function NotificationSettings() {
  const { t } = useTranslation(['settings', 'common']);
  const { notifications, updateNotifications } = useSession();
  const { toast } = useToast();

  function toggle(event: EventKey, channel: 'email' | 'inApp', value: boolean) {
    updateNotifications({
      [event]: { ...notifications[event], [channel]: value },
    } as Partial<Settings>);
  }

  return (
    <>
      <Card title={t('settings:notifications.title')} subtitle={t('settings:notifications.hint')}>
        <table className={styles.matrix}>
          <thead>
            <tr>
              <th>{t('settings:notifications.event')}</th>
              <th>{t('settings:notifications.channelEmail')}</th>
              <th>{t('settings:notifications.channelInApp')}</th>
            </tr>
          </thead>
          <tbody>
            {EVENTS.map((event) => (
              <tr key={event}>
                <td>
                  <span className={styles.matrixEvent}>
                    <span className={styles.matrixEventName}>{t(`settings:notifications.${event}`)}</span>
                    <span className={styles.matrixEventHint}>
                      {t(`settings:notifications.${event}Hint`)}
                    </span>
                  </span>
                </td>
                <td>
                  <Checkbox
                    checked={notifications[event].email}
                    ariaLabel={`${t(`settings:notifications.${event}`)} — ${t('settings:notifications.channelEmail')}`}
                    onChange={(value) => toggle(event, 'email', value)}
                  />
                </td>
                <td>
                  <Checkbox
                    checked={notifications[event].inApp}
                    ariaLabel={`${t(`settings:notifications.${event}`)} — ${t('settings:notifications.channelInApp')}`}
                    onChange={(value) => toggle(event, 'inApp', value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title={t('settings:notifications.quiet')} subtitle={t('settings:notifications.quietHint')}>
        <div className={styles.section}>
          <Switch
            spread
            checked={notifications.globalQuiet}
            label={t('settings:notifications.quietGlobal')}
            onChange={(value) => {
              updateNotifications({ globalQuiet: value });
              toast(t('settings:common.saved'));
            }}
          />

          <div className={styles.quietRow}>
            <Field label={t('settings:notifications.quietFrom')} className={styles.quietField}>
              {(props) => (
                <Input
                  {...props}
                  type="time"
                  value={notifications.quietFrom}
                  onChange={(event) => updateNotifications({ quietFrom: event.target.value })}
                />
              )}
            </Field>
            <Field label={t('settings:notifications.quietTo')} className={styles.quietField}>
              {(props) => (
                <Input
                  {...props}
                  type="time"
                  value={notifications.quietTo}
                  onChange={(event) => updateNotifications({ quietTo: event.target.value })}
                />
              )}
            </Field>
          </div>
        </div>
      </Card>
    </>
  );
}

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { useSession } from '@/app/providers/SessionProvider';
import { useToast } from '@/app/providers/ToastProvider';
import { OTHER_USERS } from '@/mocks/users';
import { Avatar, Button, Card, Field, Select, Switch } from '@/shared/ui';
import type { WhoCanMessage } from '@/types';

import styles from './Settings.module.css';

export function PrivacySettings() {
  const { t } = useTranslation(['settings', 'common']);
  const { privacy, updatePrivacy, unblockUser } = useSession();
  const { toast } = useToast();

  const blocked = OTHER_USERS.filter((user) => privacy.blockedUserIds.includes(user.id));

  return (
    <>
      <Card title={t('settings:privacy.title')}>
        <div className={styles.section}>
          <Switch
            spread
            checked={privacy.publicProfile}
            label={t('settings:privacy.publicProfile')}
            description={t('settings:privacy.publicProfileHint')}
            onChange={(value) => updatePrivacy({ publicProfile: value })}
          />

          <div className={styles.divider} />

          <Switch
            spread
            checked={privacy.showLocation}
            label={t('settings:privacy.showLocation')}
            description={t('settings:privacy.showLocationHint')}
            onChange={(value) => updatePrivacy({ showLocation: value })}
          />

          <div className={styles.divider} />

          <Field label={t('settings:privacy.whoCanMessage')}>
            {(props) => (
              <Select
                {...props}
                value={privacy.whoCanMessage}
                onChange={(event) =>
                  updatePrivacy({ whoCanMessage: event.target.value as WhoCanMessage })
                }
              >
                <option value="everyone">{t('settings:privacy.whoCanMessageEveryone')}</option>
                <option value="participants">
                  {t('settings:privacy.whoCanMessageParticipants')}
                </option>
                <option value="nobody">{t('settings:privacy.whoCanMessageNobody')}</option>
              </Select>
            )}
          </Field>
        </div>
      </Card>

      <Card title={t('settings:privacy.blocked')} subtitle={t('settings:privacy.blockedHint')}>
        {blocked.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>{t('settings:privacy.blockedEmpty')}</p>
        ) : (
          blocked.map((user) => (
            <div key={user.id} className={styles.listRow}>
              <Avatar username={user.username} color={user.avatarColor} size="sm" />
              <span className={styles.listText}>
                <Link to={`/u/${user.username}`} className={styles.listTitle}>
                  {user.username}
                </Link>
                <span className={styles.listHint}>
                  {user.specialty ? t(`common:specialty.${user.specialty}`) : ''}
                </span>
              </span>
              <span className={styles.listAction}>
                <Button
                  size="sm"
                  onClick={() => {
                    unblockUser(user.id);
                    toast(t('settings:privacy.unblocked', { username: user.username }), {
                      tone: 'info',
                    });
                  }}
                >
                  {t('common:actions.unblock')}
                </Button>
              </span>
            </div>
          ))
        )}
      </Card>
    </>
  );
}

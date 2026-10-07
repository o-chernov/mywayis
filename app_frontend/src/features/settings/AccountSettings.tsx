import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { useSession } from '@/app/providers/SessionProvider';
import { useToast } from '@/app/providers/ToastProvider';
import { AlertIcon } from '@/shared/icons';
import { Badge, Button, Card, Field, Input, Modal, ProgressBar } from '@/shared/ui';

import styles from './Settings.module.css';

/** Грубая оценка надёжности — длина плюс разнообразие символов. */
function passwordStrength(value: string): 0 | 1 | 2 | 3 {
  if (value.length < 8) return value.length === 0 ? 0 : 1;
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^\w]/].filter((pattern) => pattern.test(value)).length;
  if (value.length >= 12 && classes >= 3) return 3;
  if (classes >= 2) return 2;
  return 1;
}

const SESSIONS = [
  { id: 's1', device: 'Chrome · Windows 11', location: 'Москва, Россия', current: true },
  { id: 's2', device: 'Safari · iPhone 15', location: 'Москва, Россия', current: false },
  { id: 's3', device: 'Firefox · Ubuntu 24.04', location: 'Санкт-Петербург, Россия', current: false },
];

export function AccountSettings() {
  const { t } = useTranslation(['settings', 'common']);
  const { user, updateUser, logout } = useSession();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState(user.email);
  const [passwords, setPasswords] = useState({ current: '', next: '', repeat: '' });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [sessions, setSessions] = useState(SESSIONS);

  const strength = passwordStrength(passwords.next);
  const mismatch =
    passwords.repeat.length > 0 && passwords.next !== passwords.repeat
      ? t('settings:account.passwordMismatch')
      : undefined;
  const tooShort =
    passwords.next.length > 0 && passwords.next.length < 8
      ? t('settings:account.passwordShort')
      : undefined;

  const canChangePassword =
    passwords.current.length > 0 && passwords.next.length >= 8 && !mismatch && passwords.repeat.length > 0;

  const strengthLabel =
    strength >= 3
      ? t('settings:account.strength.strong')
      : strength === 2
        ? t('settings:account.strength.medium')
        : t('settings:account.strength.weak');

  return (
    <>
      <Card title={t('settings:account.email')}>
        <div className={styles.section}>
          <Field
            label={t('settings:account.email')}
            aside={
              user.plan ? (
                <Badge tone="success" dot>
                  {t('settings:account.emailVerified')}
                </Badge>
              ) : undefined
            }
          >
            {(props) => (
              <Input
                {...props}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            )}
          </Field>

          <div className={styles.footer}>
            <Button
              variant="primary"
              disabled={email === user.email || !email.includes('@')}
              onClick={() => {
                updateUser({ email });
                toast(t('settings:common.saved'));
              }}
            >
              {t('settings:account.changeEmail')}
            </Button>
            <Button variant="ghost" onClick={() => toast(t('settings:account.emailSent'), { tone: 'info' })}>
              {t('settings:account.emailResend')}
            </Button>
          </div>
        </div>
      </Card>

      <Card title={t('settings:account.password')}>
        <div className={styles.section}>
          <Field label={t('settings:account.passwordCurrent')}>
            {(props) => (
              <Input
                {...props}
                type="password"
                autoComplete="current-password"
                value={passwords.current}
                onChange={(event) => setPasswords({ ...passwords, current: event.target.value })}
              />
            )}
          </Field>

          <Field
            label={t('settings:account.passwordNew')}
            error={tooShort}
            hint={
              passwords.next.length > 0
                ? `${t('settings:account.strength.label')}: ${strengthLabel}`
                : undefined
            }
          >
            {(props) => (
              <>
                <Input
                  {...props}
                  type="password"
                  autoComplete="new-password"
                  value={passwords.next}
                  invalid={Boolean(tooShort)}
                  onChange={(event) => setPasswords({ ...passwords, next: event.target.value })}
                />
                {passwords.next.length > 0 && (
                  <ProgressBar
                    value={strength / 3}
                    size="thin"
                    tone={strength >= 3 ? 'success' : strength === 2 ? 'warning' : 'danger'}
                    ariaLabel={t('settings:account.strength.label')}
                  />
                )}
              </>
            )}
          </Field>

          <Field label={t('settings:account.passwordRepeat')} error={mismatch}>
            {(props) => (
              <Input
                {...props}
                type="password"
                autoComplete="new-password"
                value={passwords.repeat}
                invalid={Boolean(mismatch)}
                onChange={(event) => setPasswords({ ...passwords, repeat: event.target.value })}
              />
            )}
          </Field>

          <div className={styles.footer}>
            <Button
              variant="primary"
              disabled={!canChangePassword}
              onClick={() => {
                setPasswords({ current: '', next: '', repeat: '' });
                toast(t('settings:account.passwordChanged'));
              }}
            >
              {t('common:actions.save')}
            </Button>
          </div>
        </div>
      </Card>

      <Card title={t('settings:account.sessions')} subtitle={t('settings:account.sessionsHint')}>
        {sessions.map((session) => (
          <div key={session.id} className={styles.listRow}>
            <span className={styles.listText}>
              <span className={styles.listTitle}>{session.device}</span>
              <span className={styles.listHint}>{session.location}</span>
            </span>
            <span className={styles.listAction}>
              {session.current ? (
                <Badge tone="success" dot>
                  {t('settings:account.sessionCurrent')}
                </Badge>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSessions((current) => current.filter((item) => item.id !== session.id));
                    toast(t('settings:account.sessionEnded'), { tone: 'info' });
                  }}
                >
                  {t('settings:account.sessionEnd')}
                </Button>
              )}
            </span>
          </div>
        ))}
      </Card>

      <Card className={styles.danger} title={t('settings:account.danger')}>
        <div className={styles.dangerRow}>
          <span className={styles.dangerText}>
            <span className={styles.dangerTitle}>{t('settings:account.deleteTitle')}</span>
            <span className={styles.dangerHint}>{t('settings:account.deleteHint')}</span>
          </span>
          <span className={styles.listAction}>
            <Button variant="dangerGhost" onClick={() => setDeleteOpen(true)}>
              {t('settings:account.deleteButton')}
            </Button>
          </span>
        </div>
      </Card>

      <Modal
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteConfirm('');
        }}
        size="sm"
        iconTone="danger"
        icon={<AlertIcon width={18} height={18} />}
        title={t('settings:account.deleteConfirmTitle')}
        subtitle={t('settings:account.deleteConfirmText')}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setDeleteOpen(false);
                setDeleteConfirm('');
              }}
            >
              {t('common:actions.cancel')}
            </Button>
            <Button
              variant="danger"
              // Пока username не введён точь-в-точь, кнопка неактивна.
              disabled={deleteConfirm !== user.username}
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              {t('settings:account.deleteConfirm')}
            </Button>
          </>
        }
      >
        <Field label={t('settings:account.deleteConfirmLabel', { username: user.username })}>
          {(props) => (
            <Input
              {...props}
              value={deleteConfirm}
              autoComplete="off"
              onChange={(event) => setDeleteConfirm(event.target.value)}
            />
          )}
        </Field>
      </Modal>
    </>
  );
}

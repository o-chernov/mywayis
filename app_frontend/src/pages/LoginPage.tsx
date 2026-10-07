import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router';

import { useSession } from '@/app/providers/SessionProvider';
import { ThemeLanguageControls } from '@/layouts/AppShell/ThemeLanguageControls';
import { formatNumber } from '@/shared/lib/format';
import { getDaysLeft, getSeason } from '@/shared/lib/seasons';
import { AlertIcon, ExternalIcon, EyeIcon, EyeOffIcon } from '@/shared/icons';
import {
  Button,
  Checkbox,
  Field,
  IconButton,
  Input,
  RadioCard,
  RadioCardGroup,
} from '@/shared/ui';
import type { Persona } from '@/types';

import styles from './LoginPage.module.css';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Пароль, на котором мок специально «падает» — чтобы показать ошибку входа. */
const FAILING_PASSWORD = 'wrong';

export function LoginPage() {
  const { t, i18n } = useTranslation(['auth', 'common']);
  const { authenticated, login } = useSession();
  const navigate = useNavigate();
  const daysLeft = getDaysLeft(getSeason());

  const [email, setEmail] = useState('oleg@mywayis.com');
  const [password, setPassword] = useState('demo1234');
  const [remember, setRemember] = useState(true);
  const [persona, setPersona] = useState<Persona>('free');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [formError, setFormError] = useState<string | null>(null);

  if (authenticated) return <Navigate to="/" replace />;

  const emailError = !email
    ? t('auth:errors.emailRequired')
    : !EMAIL_PATTERN.test(email)
      ? t('auth:errors.emailInvalid')
      : null;
  const passwordError = !password
    ? t('auth:errors.passwordRequired')
    : password.length < 8
      ? t('auth:errors.passwordShort')
      : null;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setTouched({ email: true, password: true });
    setFormError(null);
    if (emailError || passwordError) return;

    setSubmitting(true);
    // Имитация запроса, чтобы состояние «Входим…» было видно.
    await new Promise((resolve) => window.setTimeout(resolve, 700));

    if (password === FAILING_PASSWORD) {
      setSubmitting(false);
      setFormError(t('auth:errors.invalidCredentials'));
      return;
    }

    login(persona);
    navigate('/', { replace: true });
  }

  return (
    <div className={styles.page}>
      <aside className={styles.aside}>
        <div className={styles.brand}>
          <span className={styles.logo}>M</span>
          <span className={styles.brandName}>{t('common:app.name')}</span>
        </div>

        <div className={styles.pitch}>
          <h1 className={styles.pitchTitle}>{t('auth:pitch.title')}</h1>
          <p className={styles.pitchText}>{t('auth:pitch.text')}</p>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{formatNumber(1248, i18n.language)}</span>
            <span className={styles.statLabel}>{t('auth:pitch.members')}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>4</span>
            <span className={styles.statLabel}>{t('auth:pitch.seasons')}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{daysLeft}</span>
            <span className={styles.statLabel}>{t('auth:pitch.daysLeft')}</span>
          </div>
        </div>
      </aside>

      <div className={styles.formSide}>
        <div className={styles.controls}>
          <ThemeLanguageControls />
        </div>

        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <div className={styles.header}>
            <h2 className={styles.title}>{t('auth:login.title')}</h2>
            <p className={styles.subtitle}>{t('auth:login.subtitle')}</p>
          </div>

          {formError && (
            <div className={styles.alert} role="alert">
              <AlertIcon className={styles.alertIcon} width={15} height={15} />
              {formError}
            </div>
          )}

          <Field label={t('auth:login.email')} error={touched.email ? (emailError ?? undefined) : undefined}>
            {(props) => (
              <Input
                {...props}
                type="email"
                autoComplete="email"
                placeholder={t('auth:login.emailPlaceholder')}
                value={email}
                invalid={touched.email && Boolean(emailError)}
                disabled={submitting}
                onChange={(event) => setEmail(event.target.value)}
                onBlur={() => setTouched((current) => ({ ...current, email: true }))}
              />
            )}
          </Field>

          <Field
            label={t('auth:login.password')}
            error={touched.password ? (passwordError ?? undefined) : undefined}
          >
            {(props) => (
              <Input
                {...props}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder={t('auth:login.passwordPlaceholder')}
                value={password}
                invalid={touched.password && Boolean(passwordError)}
                disabled={submitting}
                onChange={(event) => setPassword(event.target.value)}
                onBlur={() => setTouched((current) => ({ ...current, password: true }))}
                adornment={
                  <IconButton
                    label={showPassword ? t('auth:login.hidePassword') : t('auth:login.showPassword')}
                    size="sm"
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? <EyeOffIcon width={15} height={15} /> : <EyeIcon width={15} height={15} />}
                  </IconButton>
                }
              />
            )}
          </Field>

          <div className={styles.row}>
            <Checkbox checked={remember} onChange={setRemember} label={t('auth:login.remember')} />
            <Button variant="link" size="sm">
              {t('auth:login.forgot')}
            </Button>
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth loading={submitting}>
            {submitting ? t('auth:login.submitting') : t('auth:login.submit')}
          </Button>

          <div className={styles.footer}>
            <span className={styles.footerRow}>
              {t('auth:login.noAccount')}
              <Button
                variant="link"
                size="sm"
                iconRight={<ExternalIcon width={12} height={12} />}
                onClick={() => window.open('https://mywayis.com/register', '_blank', 'noopener')}
              >
                {t('auth:login.register')}
              </Button>
            </span>
            <span className={styles.footerHint}>{t('auth:login.registerHint')}</span>
          </div>
        </form>

        <div className={styles.demo}>
          <div className={styles.demoHeader}>
            <span className={styles.demoTitle}>{t('auth:demo.title')}</span>
            <span className={styles.demoHint}>{t('auth:demo.hint')}</span>
          </div>

          <RadioCardGroup legend={t('common:demo.persona')}>
            <RadioCard
              name="persona"
              value="new"
              checked={persona === 'new'}
              onChange={(value) => setPersona(value as Persona)}
              title={t('common:demo.new')}
              description={t('common:demo.newHint')}
            />
            <RadioCard
              name="persona"
              value="free"
              checked={persona === 'free'}
              onChange={(value) => setPersona(value as Persona)}
              title={t('common:demo.free')}
              description={t('common:demo.freeHint')}
            />
            <RadioCard
              name="persona"
              value="pro"
              checked={persona === 'pro'}
              onChange={(value) => setPersona(value as Persona)}
              title={t('common:demo.pro')}
              description={t('common:demo.proHint')}
            />
          </RadioCardGroup>
        </div>
      </div>
    </div>
  );
}

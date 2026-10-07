import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/app/providers/SessionProvider';
import { useToast } from '@/app/providers/ToastProvider';
import { cn } from '@/shared/lib/cn';
import { useFormatters } from '@/shared/lib/useFormatters';
import { CheckIcon, LockIcon, SparkleIcon } from '@/shared/icons';
import { Badge, Button, Card, Modal, Table, tableStyles } from '@/shared/ui';

import styles from './Settings.module.css';
import { PRICE_MONTH, PRICE_YEAR, UpgradeProModal } from './UpgradeProModal';

/** Что входит в тарифы. `pro: true` — доступно только на Pro. */
const FEATURES: Array<{ key: string; pro: boolean }> = [
  { key: 'dashboard', pro: false },
  { key: 'leaderboard', pro: false },
  { key: 'messages', pro: false },
  { key: 'history', pro: false },
  { key: 'aiDaily', pro: true },
  { key: 'aiChat', pro: true },
  { key: 'deepAnalytics', pro: true },
  { key: 'export', pro: true },
];

export function SubscriptionSettings() {
  const { t } = useTranslation(['settings', 'common']);
  const { subscription, isPro, setSubscription } = useSession();
  const { toast } = useToast();
  const formatters = useFormatters();

  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  return (
    <>
      <Card>
        <div className={styles.planHeader}>
          <span className={styles.planBadge}>
            {isPro ? <SparkleIcon width={20} height={20} /> : <LockIcon width={20} height={20} />}
          </span>

          <span className={styles.planText}>
            <span className={styles.planName}>
              {isPro ? t('settings:subscription.currentPro') : t('settings:subscription.currentFree')}
            </span>
            {isPro && subscription.renewsAt && (
              <span className={styles.planMeta}>
                {t('settings:subscription.renewsAt', {
                  date: formatters.date(subscription.renewsAt),
                })}
                {subscription.provider &&
                  ` · ${t('settings:subscription.provider', {
                    provider: t(`settings:subscription.providers.${subscription.provider}`),
                  })}`}
              </span>
            )}
            {!isPro && (
              <span className={styles.planMeta}>
                {formatters.money(PRICE_MONTH)} {t('settings:subscription.monthly')} ·{' '}
                {formatters.money(PRICE_YEAR)} {t('settings:subscription.yearly')}
              </span>
            )}
          </span>

          <span className={styles.planAction}>
            {isPro ? (
              <Button variant="dangerGhost" onClick={() => setCancelOpen(true)}>
                {t('settings:subscription.cancel')}
              </Button>
            ) : (
              <Button variant="primary" size="lg" onClick={() => setUpgradeOpen(true)}>
                {t('settings:subscription.upgrade')}
              </Button>
            )}
          </span>
        </div>
      </Card>

      <Card title={t('settings:subscription.compare')}>
        <div className={styles.features}>
          {FEATURES.map((feature) => {
            const available = !feature.pro || isPro;
            return (
              <div key={feature.key} className={styles.feature}>
                <span
                  className={cn(
                    styles.featureIcon,
                    available ? styles.featureIncluded : styles.featureLocked,
                  )}
                >
                  {available ? <CheckIcon width={15} height={15} /> : <LockIcon width={15} height={15} />}
                </span>
                {t(`settings:subscription.features.${feature.key}`)}
                <span className={styles.featurePlan}>
                  <Badge tone={feature.pro ? 'accent' : 'neutral'}>
                    {feature.pro ? t('common:plan.pro') : t('common:plan.free')}
                  </Badge>
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      <Card title={t('settings:subscription.payments')} flush={subscription.payments.length > 0}>
        {subscription.payments.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>{t('settings:subscription.paymentsEmpty')}</p>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>{t('settings:subscription.paymentDate')}</th>
                <th>{t('settings:subscription.paymentPeriod')}</th>
                <th>{t('settings:subscription.paymentProvider')}</th>
                <th style={{ textAlign: 'right' }}>{t('settings:subscription.paymentAmount')}</th>
                <th style={{ textAlign: 'right' }}>{t('settings:subscription.paymentStatus')}</th>
              </tr>
            </thead>
            <tbody>
              {subscription.payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{formatters.date(payment.date)}</td>
                  <td>
                    {payment.period === 'month'
                      ? t('settings:subscription.periodMonth')
                      : t('settings:subscription.periodYear')}
                  </td>
                  <td>{t(`settings:subscription.providers.${payment.provider}`)}</td>
                  <td className={tableStyles.numeric}>{formatters.money(payment.amount)}</td>
                  <td className={tableStyles.numeric}>
                    <Badge
                      tone={
                        payment.status === 'paid'
                          ? 'success'
                          : payment.status === 'refunded'
                            ? 'warning'
                            : 'danger'
                      }
                    >
                      {t(
                        `settings:subscription.status${payment.status.charAt(0).toUpperCase()}${payment.status.slice(1)}`,
                      )}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <UpgradeProModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        onPaid={(period, provider) => {
          const renewsAt = new Date();
          if (period === 'year') renewsAt.setFullYear(renewsAt.getFullYear() + 1);
          else renewsAt.setMonth(renewsAt.getMonth() + 1);

          setSubscription({
            plan: 'pro',
            renewsAt: renewsAt.toISOString(),
            provider,
            payments: [
              {
                id: `p-${Date.now()}`,
                date: new Date().toISOString(),
                amount: period === 'year' ? PRICE_YEAR : PRICE_MONTH,
                period,
                status: 'paid',
                provider,
              },
              ...subscription.payments,
            ],
          });
          setUpgradeOpen(false);
          toast(t('settings:subscription.activated'));
        }}
      />

      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        size="sm"
        iconTone="warning"
        title={t('settings:subscription.cancelTitle')}
        subtitle={t('settings:subscription.cancelText', {
          date: subscription.renewsAt ? formatters.date(subscription.renewsAt) : '—',
        })}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCancelOpen(false)}>
              {t('common:actions.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setSubscription({ plan: 'free', payments: subscription.payments });
                setCancelOpen(false);
                toast(t('settings:subscription.cancelled'), { tone: 'info' });
              }}
            >
              {t('common:actions.confirm')}
            </Button>
          </>
        }
      />
    </>
  );
}

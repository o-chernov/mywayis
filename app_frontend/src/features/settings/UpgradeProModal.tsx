import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { mockSlowRequest } from '@/mocks/mockApi';
import { useFormatters } from '@/shared/lib/useFormatters';
import { SparkleIcon } from '@/shared/icons';
import { Button, Modal, ProgressBar, RadioCard, RadioCardGroup } from '@/shared/ui';

import styles from './Settings.module.css';

export const PRICE_MONTH = 490;
export const PRICE_YEAR = 4900;

const PROVIDERS = ['yookassa', 'cloudpayments', 'tbank', 'sbp'] as const;
type Provider = (typeof PROVIDERS)[number];

interface UpgradeProModalProps {
  open: boolean;
  onClose: () => void;
  onPaid: (period: 'month' | 'year', provider: Provider) => void;
}

/**
 * Оплата в прототипе имитируется: выбираем период и кассу, затем показываем
 * экран-заглушку вместо реального редиректа на платёжный шлюз.
 */
export function UpgradeProModal({ open, onClose, onPaid }: UpgradeProModalProps) {
  const { t } = useTranslation(['settings', 'common']);
  const formatters = useFormatters();

  const [period, setPeriod] = useState<'month' | 'year'>('year');
  const [provider, setProvider] = useState<Provider>('yookassa');
  const [redirecting, setRedirecting] = useState(false);

  async function goToPayment() {
    setRedirecting(true);
    await mockSlowRequest(() => true);
  }

  if (redirecting) {
    return (
      <Modal
        open={open}
        onClose={() => setRedirecting(false)}
        size="sm"
        icon={<SparkleIcon width={18} height={18} />}
        title={t('settings:subscription.redirectTitle')}
        subtitle={t('settings:subscription.redirectText', {
          provider: t(`settings:subscription.providers.${provider}`),
        })}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setRedirecting(false);
                onClose();
              }}
            >
              {t('common:actions.cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setRedirecting(false);
                onPaid(period, provider);
              }}
            >
              {t('settings:subscription.redirectSimulate')}
            </Button>
          </>
        }
      >
        <ProgressBar value={0.65} ariaLabel={t('settings:subscription.redirectTitle')} />
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      icon={<SparkleIcon width={18} height={18} />}
      title={t('settings:subscription.modalTitle')}
      subtitle={t('settings:subscription.modalSubtitle')}
      footer={
        <>
          <span style={{ marginRight: 'auto' }} className={styles.price}>
            {formatters.money(period === 'year' ? PRICE_YEAR : PRICE_MONTH)}
          </span>
          <Button variant="ghost" onClick={onClose}>
            {t('common:actions.cancel')}
          </Button>
          <Button variant="primary" onClick={goToPayment}>
            {t('settings:subscription.toPayment')}
          </Button>
        </>
      }
    >
      <div className={styles.section}>
        <div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>
            {t('settings:subscription.choosePeriod')}
          </p>
          <RadioCardGroup legend={t('settings:subscription.choosePeriod')}>
            <div className={styles.priceCards}>
              <RadioCard
                name="period"
                value="month"
                checked={period === 'month'}
                onChange={() => setPeriod('month')}
                title={formatters.money(PRICE_MONTH)}
                description={t('settings:subscription.monthly')}
              />
              <RadioCard
                name="period"
                value="year"
                checked={period === 'year'}
                onChange={() => setPeriod('year')}
                title={formatters.money(PRICE_YEAR)}
                description={`${t('settings:subscription.yearly')} · ${t('settings:subscription.yearlyNote')}`}
              />
            </div>
          </RadioCardGroup>
        </div>

        <div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>
            {t('settings:subscription.chooseProvider')}
          </p>
          <RadioCardGroup legend={t('settings:subscription.chooseProvider')}>
            <div className={styles.providers}>
              {PROVIDERS.map((item) => (
                <RadioCard
                  key={item}
                  name="provider"
                  value={item}
                  checked={provider === item}
                  onChange={() => setProvider(item)}
                  title={t(`settings:subscription.providers.${item}`)}
                  description={t(`settings:subscription.providers.${item}Hint`)}
                />
              ))}
            </div>
          </RadioCardGroup>
        </div>
      </div>
    </Modal>
  );
}

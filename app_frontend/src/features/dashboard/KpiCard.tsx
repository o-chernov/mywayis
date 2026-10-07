import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib/cn';
import { useFormatters } from '@/shared/lib/useFormatters';
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from '@/shared/icons';

import styles from './Dashboard.module.css';

interface KpiCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  /** Текущее и предыдущее значение — дельта считается тут же. */
  current: number;
  previous: number;
  footnote?: string;
}

export function KpiCard({ icon, label, value, current, previous, footnote }: KpiCardProps) {
  const { t } = useTranslation('dashboard');
  const formatters = useFormatters();

  // При нулевой базе процент не имеет смысла — показываем как «без изменений».
  const delta = previous > 0 ? (current - previous) / previous : 0;
  const direction = Math.abs(delta) < 0.005 ? 'flat' : delta > 0 ? 'up' : 'down';

  return (
    <div className={styles.kpi}>
      <span className={styles.kpiLabel}>
        {icon}
        {label}
      </span>
      <span className={styles.kpiValue}>{value}</span>
      <span className={styles.kpiFooter}>
        <span
          className={cn(
            styles.delta,
            direction === 'up' && styles.deltaUp,
            direction === 'down' && styles.deltaDown,
            direction === 'flat' && styles.deltaFlat,
          )}
        >
          {direction === 'up' && <ArrowUpIcon width={11} height={11} />}
          {direction === 'down' && <ArrowDownIcon width={11} height={11} />}
          {direction === 'flat' && <MinusIcon width={11} height={11} />}
          {direction === 'flat' ? t('kpi.noChange') : formatters.signedPercent(delta)}
        </span>
        {footnote ?? t('kpi.vsPrevious')}
      </span>
    </div>
  );
}

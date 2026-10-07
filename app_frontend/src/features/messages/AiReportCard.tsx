import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

import { cn } from '@/shared/lib/cn';
import { useChartColors } from '@/shared/lib/useChartColors';
import { useFormatters } from '@/shared/lib/useFormatters';
import { ArrowDownIcon, ArrowUpIcon, LockIcon, SparkleIcon } from '@/shared/icons';
import { Button } from '@/shared/ui';
import type { AiReportPayload } from '@/types';

import styles from './Messages.module.css';

/**
 * Сообщение AI-агента — не текст, а карточка с метриками и выводами.
 * На Free свежий отчёт приходит размытым, с предложением подключить Pro.
 */
export function AiReportCard({ report }: { report: AiReportPayload }) {
  const { t } = useTranslation(['messages', 'dashboard']);
  const colors = useChartColors();
  const formatters = useFormatters();
  const navigate = useNavigate();

  const spark = report.sparkline.map((value, index) => ({ index, value }));
  const positive = report.deltaPercent >= 0;

  const body = (
    <div className={cn(styles.reportBody, report.locked && styles.reportBlur)}>
      <div className={styles.reportMetrics}>
        <div className={styles.reportMetric}>
          <span className={styles.reportMetricLabel}>{t('messages:ai.total')}</span>
          <span className={styles.reportMetricValue}>
            {formatters.duration(report.totalSeconds)}
          </span>
          <span
            className={styles.reportDelta}
            style={{ color: positive ? 'var(--success-text)' : 'var(--danger-text)' }}
          >
            {positive ? <ArrowUpIcon width={11} height={11} /> : <ArrowDownIcon width={11} height={11} />}
            {formatters.signedPercent(report.deltaPercent)}
          </span>
        </div>

        <div className={styles.reportMetric}>
          <span className={styles.reportMetricLabel}>{t('messages:ai.focus')}</span>
          <span className={styles.reportMetricValue}>{report.focusScore}</span>
        </div>

        <div className={styles.reportMetric}>
          <span className={styles.reportMetricLabel}>{t('messages:ai.topLanguage')}</span>
          <span className={styles.reportMetricValue}>{report.topLanguage}</span>
        </div>
      </div>

      <div className={styles.reportSpark}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={spark} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="reportFade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.accent} stopOpacity={0.4} />
                <stop offset="100%" stopColor={colors.accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={colors.accent}
              strokeWidth={1.6}
              fill="url(#reportFade)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.reportBullets}>
        {report.bullets.map((bullet) => (
          <p key={bullet} className={styles.reportBullet}>
            <span className={styles.reportBulletDot} aria-hidden="true" />
            {bullet}
          </p>
        ))}
      </div>
    </div>
  );

  return (
    <div className={cn(styles.report, report.locked && styles.reportLocked)}>
      <div className={styles.reportHead}>
        <SparkleIcon width={15} height={15} style={{ color: 'var(--accent-text)' }} />
        <span className={styles.reportTitle}>
          {t('messages:ai.report', { period: report.periodLabel })}
        </span>
      </div>

      {body}

      {report.locked && (
        <div className={styles.reportOverlay}>
          <span className={styles.reportOverlayTitle}>
            <LockIcon width={15} height={15} />
            {t('messages:ai.lockedTitle')}
          </span>
          <span className={styles.reportOverlayText}>{t('messages:ai.lockedText')}</span>
          <Button variant="primary" size="sm" onClick={() => navigate('/settings/subscription')}>
            {t('messages:ai.lockedCta')}
          </Button>
        </div>
      )}
    </div>
  );
}

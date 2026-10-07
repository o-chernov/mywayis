import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import { useFormatters } from '@/shared/lib/useFormatters';

import styles from './Dashboard.module.css';

const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const HOUR_LABELS = [0, 3, 6, 9, 12, 15, 18, 21];

/** Пять ступеней интенсивности — больше глаз всё равно не различает. */
function heatLevel(seconds: number, max: number): number {
  if (seconds <= 0 || max <= 0) return 0;
  const ratio = seconds / max;
  if (ratio < 0.2) return 1;
  if (ratio < 0.45) return 2;
  if (ratio < 0.72) return 3;
  return 4;
}

export function ActivityHeatmap({ data }: { data: number[][] }) {
  const { t } = useTranslation('dashboard');
  const formatters = useFormatters();

  const max = Math.max(...data.flat(), 1);

  return (
    <>
      <div className={styles.heatmap}>
        {data.map((row, dayIndex) => (
          <Fragment key={WEEKDAYS[dayIndex]}>
            <span className={styles.heatLabel}>{t(`weekdays.${WEEKDAYS[dayIndex]}`)}</span>
            {row.map((seconds, hour) => (
              // Нативный title вместо компонента-подсказки: ячеек 168, и
              // держать на каждой собственное состояние — расточительство.
              <span
                key={hour}
                className={styles.heatCell}
                style={{ background: `var(--heat-${heatLevel(seconds, max)})` }}
                title={`${t(`weekdays.${WEEKDAYS[dayIndex]}`)}, ${String(hour).padStart(2, '0')}:00 — ${
                  seconds > 0 ? formatters.duration(seconds) : t('charts.noData')
                }`}
              />
            ))}
          </Fragment>
        ))}
      </div>

      <div className={styles.heatHours} aria-hidden="true">
        <span />
        {Array.from({ length: 24 }, (_, hour) => (
          <span key={hour} className={styles.heatHour}>
            {HOUR_LABELS.includes(hour) ? hour : ''}
          </span>
        ))}
      </div>

      <div className={styles.heatScale}>
        {t('charts.less')}
        <span className={styles.heatScaleCells}>
          {[0, 1, 2, 3, 4].map((level) => (
            <span
              key={level}
              className={styles.heatScaleCell}
              style={{ background: `var(--heat-${level})` }}
            />
          ))}
        </span>
        {t('charts.more')}
      </div>
    </>
  );
}

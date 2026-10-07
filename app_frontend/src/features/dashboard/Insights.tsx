import { useTranslation } from 'react-i18next';

import { useFormatters } from '@/shared/lib/useFormatters';
import type { DashboardStats } from '@/types';

import styles from './Dashboard.module.css';

const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

/**
 * «Лёгкая аналитика» бесплатного тарифа: несколько наблюдений, которые
 * считаются арифметикой, без всякого AI.
 */
function buildInsights(
  stats: DashboardStats,
  t: (key: string, options?: Record<string, unknown>) => string,
  formatters: ReturnType<typeof useFormatters>,
): string[] {
  const result: string[] = [];

  // Пиковое окно: находим максимум в сетке день × час.
  let peakDay = 0;
  let peakHour = 0;
  let peakValue = -1;
  stats.hourly.forEach((row, dayIndex) => {
    row.forEach((value, hour) => {
      if (value > peakValue) {
        peakValue = value;
        peakDay = dayIndex;
        peakHour = hour;
      }
    });
  });

  if (peakValue > 0) {
    result.push(
      t('insights.peakHour', {
        weekday: t(`weekdays.${WEEKDAYS[peakDay]}`),
        from: `${String(peakHour).padStart(2, '0')}:00`,
        to: `${String((peakHour + 3) % 24).padStart(2, '0')}:00`,
      }),
    );
  }

  const [topLanguage] = stats.languages;
  if (topLanguage) {
    result.push(
      t('insights.topLanguage', {
        language: topLanguage.name,
        share: formatters.percent(topLanguage.share),
      }),
    );
  }

  const weekendSeconds = stats.daily
    .filter((day) => {
      const weekday = new Date(`${day.date}T00:00:00`).getDay();
      return weekday === 0 || weekday === 6;
    })
    .reduce((sum, day) => sum + day.seconds, 0);

  if (stats.totalSeconds > 0) {
    result.push(
      t('insights.weekendRatio', {
        share: formatters.percent(weekendSeconds / stats.totalSeconds),
      }),
    );
  }

  const [topProject] = stats.projects;
  if (topProject) {
    result.push(
      t('insights.topProject', {
        project: topProject.name,
        duration: formatters.duration(topProject.seconds),
      }),
    );
  }

  return result.slice(0, 4);
}

export function Insights({ stats }: { stats: DashboardStats }) {
  const { t } = useTranslation('dashboard');
  const formatters = useFormatters();

  const insights = buildInsights(stats, t, formatters);

  return (
    <div className={styles.insights}>
      {insights.map((text) => (
        <p key={text} className={styles.insight}>
          <span className={styles.insightBullet} aria-hidden="true" />
          {text}
        </p>
      ))}
    </div>
  );
}

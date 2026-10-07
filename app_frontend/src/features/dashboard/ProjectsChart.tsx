import { useTranslation } from 'react-i18next';

import { useChartColors } from '@/shared/lib/useChartColors';
import { useFormatters } from '@/shared/lib/useFormatters';
import type { ProjectShare } from '@/types';

import styles from './Dashboard.module.css';

/**
 * Горизонтальные бары рисуем вручную: пять строк с подписями читаются лучше,
 * чем BarChart с повёрнутой осью, и весят ноль.
 */
export function ProjectsChart({ data }: { data: ProjectShare[] }) {
  const { t } = useTranslation('dashboard');
  const colors = useChartColors();
  const formatters = useFormatters();

  const max = Math.max(...data.map((item) => item.seconds), 1);

  if (data.length === 0 || max <= 1) {
    return <p style={{ color: 'var(--text-muted)' }}>{t('charts.noData')}</p>;
  }

  return (
    <div className={styles.projects}>
      {data.map((project, index) => (
        <div key={project.name} className={styles.project}>
          <div className={styles.projectHead}>
            <span className={styles.projectName}>{project.name}</span>
            <span className={styles.projectValue}>{formatters.duration(project.seconds)}</span>
          </div>
          <div
            style={{
              height: 6,
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-inset)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${(project.seconds / max) * 100}%`,
                height: '100%',
                borderRadius: 'var(--radius-full)',
                background: colors.viz[index % colors.viz.length],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

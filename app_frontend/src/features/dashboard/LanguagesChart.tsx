import { useTranslation } from 'react-i18next';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { useChartColors } from '@/shared/lib/useChartColors';
import { useFormatters } from '@/shared/lib/useFormatters';
import type { LanguageShare } from '@/types';

import styles from './Dashboard.module.css';

const VISIBLE = 6;

export function LanguagesChart({ data }: { data: LanguageShare[] }) {
  const { t } = useTranslation('dashboard');
  const colors = useChartColors();
  const formatters = useFormatters();

  // Хвост сворачиваем в «Прочее» — иначе легенда превращается в простыню.
  const top = data.slice(0, VISIBLE);
  const rest = data.slice(VISIBLE);
  const restSeconds = rest.reduce((sum, item) => sum + item.seconds, 0);
  const total = data.reduce((sum, item) => sum + item.seconds, 0);

  const slices = [
    ...top,
    ...(restSeconds > 0
      ? [{ name: t('charts.other'), seconds: restSeconds, share: restSeconds / total }]
      : []),
  ];

  if (total === 0) {
    return <p style={{ color: 'var(--text-muted)' }}>{t('charts.noData')}</p>;
  }

  return (
    <>
      <div style={{ height: 176 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="seconds"
              nameKey="name"
              innerRadius={52}
              outerRadius={82}
              paddingAngle={2}
              stroke="none"
            >
              {slices.map((slice, index) => (
                <Cell key={slice.name} fill={colors.viz[index % colors.viz.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const slice = payload[0].payload as (typeof slices)[number];
                return (
                  <div className={styles.tooltip}>
                    <div className={styles.tooltipLabel}>{slice.name}</div>
                    <div className={styles.tooltipValue}>
                      {formatters.duration(slice.seconds)} · {formatters.percent(slice.share)}
                    </div>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.legend}>
        {slices.map((slice, index) => (
          <div key={slice.name} className={styles.legendRow}>
            <span
              className={styles.legendDot}
              style={{ background: colors.viz[index % colors.viz.length] }}
            />
            <span className={styles.legendName}>{slice.name}</span>
            <span className={styles.legendValue}>{formatters.duration(slice.seconds)}</span>
            <span className={styles.legendShare}>{formatters.percent(slice.share)}</span>
          </div>
        ))}
      </div>
    </>
  );
}

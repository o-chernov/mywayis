import { useTranslation } from 'react-i18next';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { toHours } from '@/shared/lib/format';
import { useChartColors } from '@/shared/lib/useChartColors';
import { useFormatters } from '@/shared/lib/useFormatters';
import type { DailyActivity } from '@/types';

import styles from './Dashboard.module.css';

interface ActivityChartProps {
  data: DailyActivity[];
}

export function ActivityChart({ data }: ActivityChartProps) {
  const { t } = useTranslation('dashboard');
  const colors = useChartColors();
  const formatters = useFormatters();

  const points = data.map((day) => ({
    date: day.date,
    hours: toHours(day.seconds),
    seconds: day.seconds,
  }));

  // На длинных периодах подписи по оси X не помещаются — прореживаем.
  const tickInterval = points.length > 20 ? Math.ceil(points.length / 10) - 1 : 0;

  return (
    <div className={styles.chartBox}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={points} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid stroke={colors.grid} vertical={false} />
          <XAxis
            dataKey="date"
            stroke={colors.axis}
            tickLine={false}
            axisLine={false}
            interval={tickInterval}
            tick={{ fontSize: 11 }}
            tickFormatter={(value: string) => formatters.dayMonth(value)}
          />
          <YAxis
            stroke={colors.axis}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11 }}
            width={44}
            tickFormatter={(value: number) => `${value}`}
          />
          <Tooltip
            cursor={{ fill: colors.grid, opacity: 0.4 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const point = payload[0].payload as (typeof points)[number];
              return (
                <div className={styles.tooltip}>
                  <div className={styles.tooltipLabel}>
                    {formatters.date(point.date, { day: 'numeric', month: 'long', weekday: 'short' })}
                  </div>
                  <div className={styles.tooltipValue}>
                    {point.seconds > 0 ? formatters.duration(point.seconds) : t('charts.noData')}
                  </div>
                </div>
              );
            }}
          />
          <Bar dataKey="hours" fill={colors.accent} radius={[3, 3, 0, 0]} maxBarSize={26} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

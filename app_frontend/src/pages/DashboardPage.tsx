import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { useSession } from '@/app/providers/SessionProvider';
import { useToast } from '@/app/providers/ToastProvider';
import { ActivityChart } from '@/features/dashboard/ActivityChart';
import { ActivityHeatmap } from '@/features/dashboard/ActivityHeatmap';
import { AiPanel } from '@/features/dashboard/AiPanel';
import { Insights } from '@/features/dashboard/Insights';
import { KpiCard } from '@/features/dashboard/KpiCard';
import { LanguagesChart } from '@/features/dashboard/LanguagesChart';
import { ProjectsChart } from '@/features/dashboard/ProjectsChart';
import { TournamentWidget } from '@/features/dashboard/TournamentWidget';
import { PageHeader } from '@/layouts/PageHeader/PageHeader';
import { mockRequest } from '@/mocks/mockApi';
import { buildStats, type PeriodId } from '@/mocks/stats';
import { useAsync } from '@/shared/lib/useAsync';
import { useFormatters } from '@/shared/lib/useFormatters';
import {
  ClockIcon,
  CodeIcon,
  CrownIcon,
  FlameIcon,
  PlugIcon,
  RefreshIcon,
} from '@/shared/icons';
import { Button, Card, EmptyState, SegmentedControl, Skeleton } from '@/shared/ui';

import styles from '@/features/dashboard/Dashboard.module.css';

function greetingKey(hour: number): string {
  if (hour < 5) return 'greeting.night';
  if (hour < 12) return 'greeting.morning';
  if (hour < 18) return 'greeting.day';
  return 'greeting.evening';
}

export function DashboardPage() {
  const { t } = useTranslation(['dashboard', 'common']);
  const { user, integrations } = useSession();
  const { toast } = useToast();
  const navigate = useNavigate();
  const formatters = useFormatters();

  const [period, setPeriod] = useState<PeriodId>('month');
  const [reloadKey, setReloadKey] = useState(0);

  const connected = integrations.wakatime.status === 'connected';
  const hasTags = integrations.trackedTags.length > 0;

  const factory = useCallback(() => mockRequest(() => buildStats(period)), [period]);
  const { data: stats, loading } = useAsync(factory, `${period}:${reloadKey}:${connected}`);

  const greeting = t(greetingKey(new Date().getHours()), { name: user.firstName ?? user.username });

  // Без интеграции считать нечего — предлагаем подключиться, а не показываем нули.
  if (!connected) {
    return (
      <>
        <PageHeader title={greeting} subtitle={t('dashboard:subtitle')} />
        <Card>
          <EmptyState
            icon={<PlugIcon width={22} height={22} />}
            title={t('dashboard:empty.title')}
            description={t('dashboard:empty.description')}
            actions={
              <Button variant="primary" size="lg" onClick={() => navigate('/integrations')}>
                {t('dashboard:empty.cta')}
              </Button>
            }
          />
        </Card>
      </>
    );
  }

  if (!hasTags) {
    return (
      <>
        <PageHeader title={greeting} subtitle={t('dashboard:subtitle')} />
        <Card>
          <EmptyState
            icon={<CodeIcon width={22} height={22} />}
            title={t('dashboard:empty.noTags')}
            description={t('dashboard:empty.noTagsDescription')}
            actions={
              <Button variant="primary" onClick={() => navigate('/integrations')}>
                {t('dashboard:empty.noTagsCta')}
              </Button>
            }
          />
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={greeting}
        subtitle={t('dashboard:subtitle')}
        actions={
          <>
            <SegmentedControl<PeriodId>
              ariaLabel={t('dashboard:period.label')}
              value={period}
              onChange={setPeriod}
              options={[
                { value: 'today', label: t('dashboard:period.today') },
                { value: 'week', label: t('dashboard:period.week') },
                { value: 'month', label: t('dashboard:period.month') },
                { value: 'season', label: t('dashboard:period.season') },
              ]}
            />
            <Button
              iconLeft={<RefreshIcon width={14} height={14} />}
              onClick={() => {
                setReloadKey((value) => value + 1);
                toast(t('dashboard:sync.refreshed'));
              }}
            >
              {t('dashboard:sync.refresh')}
            </Button>
          </>
        }
      />

      {loading || !stats ? (
        <div className={styles.skeletonGrid}>
          <div className={styles.kpiRow}>
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className={styles.kpi}>
                <Skeleton variant="text" width={96} />
                <Skeleton height={30} width={128} />
                <Skeleton variant="text" width={140} />
              </div>
            ))}
          </div>
          <div className={styles.chartsRow}>
            <Card>
              <Skeleton height={240} />
            </Card>
            <Card>
              <Skeleton height={240} />
            </Card>
          </div>
        </div>
      ) : (
        <div className={styles.layout}>
          <div className={styles.kpiRow} data-tour="dashboard-kpi">
            <KpiCard
              icon={<ClockIcon width={13} height={13} />}
              label={t('dashboard:kpi.total')}
              value={formatters.duration(stats.totalSeconds)}
              current={stats.totalSeconds}
              previous={stats.totalSecondsPrev}
            />
            <KpiCard
              icon={<CodeIcon width={13} height={13} />}
              label={t('dashboard:kpi.average')}
              value={formatters.duration(stats.dailyAverageSeconds)}
              current={stats.dailyAverageSeconds}
              previous={stats.dailyAverageSecondsPrev}
              footnote={t('dashboard:kpi.activeDays', {
                count: stats.daily.filter((day) => day.seconds > 0).length,
              })}
            />
            <KpiCard
              icon={<CrownIcon width={13} height={13} />}
              label={t('dashboard:kpi.best')}
              value={formatters.duration(stats.bestDay.seconds)}
              current={stats.bestDay.seconds}
              previous={stats.bestDayPrev.seconds}
              footnote={formatters.dayMonth(stats.bestDay.date)}
            />
            <KpiCard
              icon={<FlameIcon width={13} height={13} />}
              label={t('dashboard:kpi.streak')}
              value={t('dashboard:kpi.streakValue', { count: stats.currentStreak })}
              current={stats.currentStreak}
              previous={stats.previousStreak}
            />
          </div>

          <div className={styles.chartsRow}>
            <Card
              title={t('dashboard:charts.daily')}
              subtitle={t('dashboard:charts.dailyHint')}
              actions={
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  {t('dashboard:sync.updated', {
                    time: formatters.relative(stats.lastSyncedAt),
                  })}
                </span>
              }
            >
              <ActivityChart data={stats.daily} />
            </Card>

            <Card title={t('dashboard:charts.languages')} subtitle={t('dashboard:charts.languagesHint')}>
              <LanguagesChart data={stats.languages} />
            </Card>
          </div>

          <div className={styles.bottomRow}>
            <Card title={t('dashboard:charts.heatmap')} subtitle={t('dashboard:charts.heatmapHint')}>
              <ActivityHeatmap data={stats.hourly} />
            </Card>

            <Card title={t('dashboard:charts.projects')} subtitle={t('dashboard:charts.projectsHint')}>
              <ProjectsChart data={stats.projects} />
            </Card>
          </div>

          <div className={styles.sideRow}>
            <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
              <Card title={t('dashboard:insights.title')} subtitle={t('dashboard:insights.hint')}>
                <Insights stats={stats} />
              </Card>
              <AiPanel />
            </div>

            <TournamentWidget />
          </div>
        </div>
      )}
    </>
  );
}

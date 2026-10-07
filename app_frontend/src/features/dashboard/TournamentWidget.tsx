import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { useSession } from '@/app/providers/SessionProvider';
import { buildLeaderboard } from '@/mocks/leaderboard';
import { CURRENT_USER_BASE } from '@/mocks/users';
import { cn } from '@/shared/lib/cn';
import { getDaysLeft, getSeason, getSeasonProgress } from '@/shared/lib/seasons';
import { useFormatters } from '@/shared/lib/useFormatters';
import { ArrowDownIcon, ArrowUpIcon, MinusIcon, TrophyIcon } from '@/shared/icons';
import { Button, Card, EmptyState, ProgressBar } from '@/shared/ui';

import styles from './Dashboard.module.css';

export function TournamentWidget() {
  const { t } = useTranslation(['dashboard', 'common']);
  const { integrations } = useSession();
  const navigate = useNavigate();
  const formatters = useFormatters();

  const season = getSeason();
  const daysLeft = getDaysLeft(season);
  const progress = getSeasonProgress(season);

  if (!integrations.leaderboard.participating) {
    return (
      <Card title={t('dashboard:tournament.title')}>
        <EmptyState
          compact
          icon={<TrophyIcon width={20} height={20} />}
          title={t('dashboard:tournament.notParticipating')}
          description={t('dashboard:tournament.notParticipatingHint')}
          actions={
            <Button variant="primary" size="sm" onClick={() => navigate('/integrations')}>
              {t('dashboard:tournament.join')}
            </Button>
          }
        />
      </Card>
    );
  }

  const rows = buildLeaderboard(CURRENT_USER_BASE, true);
  const self = rows.find((row) => row.isCurrentUser);
  if (!self) return null;

  const direction = self.rankDelta === 0 ? 'flat' : self.rankDelta > 0 ? 'up' : 'down';

  return (
    <Card
      title={t('dashboard:tournament.title')}
      actions={
        <Button size="sm" onClick={() => navigate('/leaderboard')}>
          {t('dashboard:tournament.openLeaderboard')}
        </Button>
      }
    >
      <div className={styles.tournament}>
        <div className={styles.rankRow}>
          <span className={styles.rankValue}>#{self.rank}</span>
          <span className={styles.rankOf}>{t('dashboard:tournament.of', { total: rows.length })}</span>
          <span
            className={cn(
              styles.delta,
              direction === 'up' && styles.deltaUp,
              direction === 'down' && styles.deltaDown,
              direction === 'flat' && styles.deltaFlat,
            )}
            style={{ marginLeft: 'auto' }}
          >
            {direction === 'up' && <ArrowUpIcon width={12} height={12} />}
            {direction === 'down' && <ArrowDownIcon width={12} height={12} />}
            {direction === 'flat' && <MinusIcon width={12} height={12} />}
            {Math.abs(self.rankDelta) || ''} {t('dashboard:tournament.delta')}
          </span>
        </div>

        <div className={styles.seasonRow}>
          <span className={styles.seasonLabel}>
            {t(`common:seasons.${season.id}`)} {season.year}
            <span className={styles.seasonDays}>
              {daysLeft > 0
                ? t('common:seasons.daysLeft', { days: formatters.days(daysLeft) })
                : t('common:seasons.finished')}
            </span>
          </span>
          <ProgressBar value={progress} size="thin" />
        </div>

        <div className={styles.seasonLabel}>
          {t('dashboard:kpi.total')}
          <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {formatters.duration(self.seconds)}
          </strong>
        </div>
      </div>
    </Card>
  );
}

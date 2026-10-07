import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';

import { useSession } from '@/app/providers/SessionProvider';
import { useToast } from '@/app/providers/ToastProvider';
import { buildLeaderboard } from '@/mocks/leaderboard';
import { buildStats } from '@/mocks/stats';
import { CURRENT_USER_BASE, findUserByUsername } from '@/mocks/users';
import { countryName } from '@/mocks/leaderboard';
import { toHours } from '@/shared/lib/format';
import { getSeason } from '@/shared/lib/seasons';
import { useChartColors } from '@/shared/lib/useChartColors';
import { useFormatters } from '@/shared/lib/useFormatters';
import {
  AlertIcon,
  ClockIcon,
  GlobeIcon,
  MessageIcon,
  MoreIcon,
  SearchIcon,
  SettingsIcon,
  TrophyIcon,
} from '@/shared/icons';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Chip,
  EmptyState,
  Menu,
  MenuItem,
  MenuSeparator,
} from '@/shared/ui';

import { useSeasonLabel } from '@/features/leaderboard/SeasonHeader';

import styles from './UserProfilePage.module.css';

export function UserProfilePage() {
  const { t, i18n } = useTranslation(['profile', 'common']);
  const { username = '' } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: me, privacy, blockUser, unblockUser, integrations } = useSession();
  const colors = useChartColors();
  const formatters = useFormatters();
  const seasonLabel = useSeasonLabel();

  const isSelf = username === me.username;
  const profile = isSelf ? me : findUserByUsername(username);

  const leaderboard = useMemo(
    () => buildLeaderboard(CURRENT_USER_BASE, integrations.leaderboard.participating),
    [integrations.leaderboard.participating],
  );

  // Спарклайн строим из тех же моков, что и дашборд, — цифры не расходятся.
  const sparkline = useMemo(
    () => buildStats('month').daily.map((day) => ({ date: day.date, hours: toHours(day.seconds) })),
    [],
  );

  if (!profile) {
    return (
      <Card>
        <EmptyState
          icon={<SearchIcon width={22} height={22} />}
          title={t('profile:notFound.title')}
          description={t('profile:notFound.description')}
          actions={
            <Button variant="primary" onClick={() => navigate('/leaderboard')}>
              {t('common:nav.leaderboard')}
            </Button>
          }
        />
      </Card>
    );
  }

  const isBlocked = privacy.blockedUserIds.includes(profile.id);
  const entry = leaderboard.find((row) => row.user.id === profile.id);
  const season = getSeason();
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ');

  return (
    <>
      {isBlocked && (
        <div className={styles.blockedNotice}>
          <AlertIcon width={15} height={15} />
          {t('profile:blocked.notice')}
        </div>
      )}

      <div className={styles.hero}>
        <Avatar
          username={profile.username}
          src={profile.avatarUrl}
          color={profile.avatarColor}
          size="xl"
          ring
        />

        <div className={styles.heroText}>
          <div className={styles.nameRow}>
            <span className={styles.username}>{profile.username}</span>
            {fullName && <span className={styles.realName}>{fullName}</span>}
            {profile.specialty && (
              <Badge tone="accent">{t(`common:specialty.${profile.specialty}`)}</Badge>
            )}
            {profile.plan === 'pro' && <Badge tone="accent">{t('common:plan.proBadge')}</Badge>}
            {isBlocked && <Badge tone="danger">{t('profile:blocked.badge')}</Badge>}
          </div>

          <div className={styles.meta}>
            {profile.city && (
              <span className={styles.metaItem}>
                <GlobeIcon width={13} height={13} />
                {profile.city}, {countryName(profile.country, i18n.language)}
              </span>
            )}
            <span className={styles.metaItem}>
              <ClockIcon width={13} height={13} />
              {t('profile:localTime', { time: formatters.timeInZone(profile.timezone) })}
            </span>
            <span className={styles.metaItem}>
              {/* Полная дата, а не «месяц + год»: русский Intl даёт номинатив
                  («ноябрь 2025»), и после предлога «с» это читается неверно. */}
              {t('profile:joined', { date: formatters.date(profile.joinedAt) })}
            </span>
          </div>

          {profile.specialtyDescription && (
            <p className={styles.description}>{profile.specialtyDescription}</p>
          )}
        </div>

        <div className={styles.heroActions}>
          {isSelf ? (
            <Button
              variant="primary"
              iconLeft={<SettingsIcon width={14} height={14} />}
              onClick={() => navigate('/settings/profile')}
            >
              {t('profile:actions.edit')}
            </Button>
          ) : (
            <>
              <Button
                variant="primary"
                disabled={isBlocked}
                iconLeft={<MessageIcon width={14} height={14} />}
                onClick={() => navigate(`/messages?to=${profile.username}`)}
              >
                {t('profile:actions.write')}
              </Button>

              <Menu
                trigger={({ toggle }) => (
                  <Button onClick={toggle} aria-label={t('common:actions.openMenu')}>
                    <MoreIcon width={15} height={15} />
                  </Button>
                )}
              >
                {({ close }) => (
                  <>
                    <MenuItem
                      onClick={() => {
                        toast(t('profile:actions.reported'), { tone: 'info' });
                        close();
                      }}
                    >
                      {t('profile:actions.report')}
                    </MenuItem>
                    <MenuSeparator />
                    <MenuItem
                      danger={!isBlocked}
                      onClick={() => {
                        if (isBlocked) unblockUser(profile.id);
                        else blockUser(profile.id);
                        close();
                      }}
                    >
                      {isBlocked ? t('profile:actions.unblock') : t('profile:actions.block')}
                    </MenuItem>
                  </>
                )}
              </Menu>
            </>
          )}
        </div>
      </div>

      <div className={styles.layout}>
        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          <Card title={t('profile:languages')}>
            {profile.languages.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>{t('profile:languagesEmpty')}</p>
            ) : (
              <div className={styles.langList}>
                {profile.languages.map((language, index) => (
                  <Chip
                    key={language.name}
                    color={colors.viz[index % colors.viz.length]}
                    count={formatters.percent(language.share)}
                  >
                    {language.name}
                  </Chip>
                ))}
              </div>
            )}
          </Card>

          <Card title={t('profile:activity')}>
            <div className={styles.sparkline}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparkline} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="profileFade" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={colors.accent} stopOpacity={0.45} />
                      <stop offset="100%" stopColor={colors.accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const point = payload[0].payload as (typeof sparkline)[number];
                      return (
                        <div
                          style={{
                            padding: 'var(--space-2) var(--space-3)',
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border-default)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--text-sm)',
                          }}
                        >
                          {formatters.dayMonth(point.date)} · {point.hours} ч
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke={colors.accent}
                    strokeWidth={2}
                    fill="url(#profileFade)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card
          title={
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <TrophyIcon width={15} height={15} />
              {t('profile:tournament.title')}
            </span>
          }
          subtitle={seasonLabel(season)}
        >
          {entry ? (
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>{t('profile:tournament.rank')}</span>
                <span className={styles.statValue}>#{entry.rank}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>{t('profile:tournament.hours')}</span>
                <span className={styles.statValue}>{formatters.duration(entry.seconds)}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>{t('profile:tournament.bestSeason')}</span>
                <span className={styles.statValue}>#{Math.max(1, entry.rank - 2)}</span>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>{t('profile:tournament.notParticipating')}</p>
          )}
        </Card>
      </div>
    </>
  );
}

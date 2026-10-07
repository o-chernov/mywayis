import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';

import { useSession } from '@/app/providers/SessionProvider';
import { SeasonHeader } from '@/features/leaderboard/SeasonHeader';
import { ALL_SPECIALTIES } from '@/features/onboarding/SpecialtySelect';
import { PageHeader } from '@/layouts/PageHeader/PageHeader';
import { buildLeaderboard, COUNTRIES, countryName } from '@/mocks/leaderboard';
import { CURRENT_USER_BASE } from '@/mocks/users';
import { cn } from '@/shared/lib/cn';
import { getSeason } from '@/shared/lib/seasons';
import { useFormatters } from '@/shared/lib/useFormatters';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  FlameIcon,
  MinusIcon,
  SearchIcon,
  TrophyIcon,
} from '@/shared/icons';
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Select,
  SortableHeader,
  Table,
  tableStyles,
} from '@/shared/ui';
import type { LeaderboardEntry, Season, SpecialtyId } from '@/types';

import styles from '@/features/leaderboard/Leaderboard.module.css';

type SortKey = 'rank' | 'seconds' | 'streak';

const PAGE_SIZE = 12;

function MedalOrRank({ rank }: { rank: number }) {
  if (rank > 3) return <>{rank}</>;
  const tone = rank === 1 ? styles.gold : rank === 2 ? styles.silver : styles.bronze;
  return <span className={cn(styles.medal, tone)}>{rank}</span>;
}

function RankDelta({ value }: { value: number }) {
  const direction = value === 0 ? 'flat' : value > 0 ? 'up' : 'down';
  return (
    <span
      className={cn(
        styles.delta,
        direction === 'up' && styles.deltaUp,
        direction === 'down' && styles.deltaDown,
        direction === 'flat' && styles.deltaFlat,
      )}
    >
      {direction === 'up' && <ArrowUpIcon width={12} height={12} />}
      {direction === 'down' && <ArrowDownIcon width={12} height={12} />}
      {direction === 'flat' && <MinusIcon width={12} height={12} />}
      {value === 0 ? '' : Math.abs(value)}
    </span>
  );
}

export function LeaderboardPage() {
  const { t, i18n } = useTranslation(['leaderboard', 'common']);
  const { integrations, updateIntegrations } = useSession();
  const navigate = useNavigate();
  const formatters = useFormatters();

  const currentSeason = getSeason();
  const [season, setSeason] = useState<Season>(currentSeason);
  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState<SpecialtyId | ''>('');
  const [language, setLanguage] = useState('');
  const [country, setCountry] = useState('');
  const [sort, setSort] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({
    key: 'rank',
    direction: 'asc',
  });
  const [visible, setVisible] = useState(PAGE_SIZE);

  const participating = integrations.leaderboard.participating;
  const wakatimeConnected = integrations.wakatime.status === 'connected';

  const allRows = useMemo(
    () => buildLeaderboard(CURRENT_USER_BASE, participating),
    [participating],
  );

  const languages = useMemo(
    () => Array.from(new Set(allRows.map((row) => row.topLanguage))).sort(),
    [allRows],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return allRows.filter((row) => {
      if (normalized && !row.user.username.toLowerCase().includes(normalized)) return false;
      if (specialty && row.user.specialty !== specialty) return false;
      if (language && row.topLanguage !== language) return false;
      if (country && row.user.country !== country) return false;
      return true;
    });
  }, [allRows, query, specialty, language, country]);

  const sorted = useMemo(() => {
    const factor = sort.direction === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sort.key === 'rank') return (a.rank - b.rank) * factor;
      if (sort.key === 'seconds') return (a.seconds - b.seconds) * factor;
      return (a.streak - b.streak) * factor;
    });
  }, [filtered, sort]);

  const shown = sorted.slice(0, visible);
  const self = allRows.find((row) => row.isCurrentUser);
  // Строку «вы» закрепляем внизу, только если её не видно в текущем срезе.
  const selfVisible = shown.some((row) => row.isCurrentUser);

  function toggleSort(key: SortKey) {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: key === 'rank' ? 'asc' : 'desc' },
    );
  }

  function resetFilters() {
    setQuery('');
    setSpecialty('');
    setLanguage('');
    setCountry('');
  }

  const hasFilters = Boolean(query || specialty || language || country);

  function renderRow(row: LeaderboardEntry, sticky = false) {
    return (
      <tr
        key={row.user.id + (sticky ? '-sticky' : '')}
        className={cn(
          row.isCurrentUser && tableStyles.highlighted,
          sticky && tableStyles.stickySelf,
        )}
      >
        <td className={styles.rankCell}>
          <MedalOrRank rank={row.rank} />
        </td>
        <td>
          <span className={styles.userCell}>
            <Avatar
              username={row.user.username}
              src={row.user.avatarUrl}
              color={row.user.avatarColor}
              size="sm"
            />
            <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <Link to={`/u/${row.user.username}`} className={styles.username}>
                {row.user.username}
                {row.isCurrentUser && (
                  <Badge tone="accent" className={styles.youBadge}>
                    {t('leaderboard:you')}
                  </Badge>
                )}
              </Link>
              <span className={styles.location}>
                {row.user.city}, {countryName(row.user.country, i18n.language)}
              </span>
            </span>
          </span>
        </td>
        <td className={styles.specialtyCell}>
          {row.user.specialty ? t(`common:specialty.${row.user.specialty}`) : '—'}
        </td>
        <td className={styles.hoursCell}>{formatters.duration(row.seconds)}</td>
        <td>{row.topLanguage}</td>
        <td>
          <span className={styles.streakCell}>
            <FlameIcon width={13} height={13} />
            {t('leaderboard:streakValue', { count: row.streak })}
          </span>
        </td>
        <td className={styles.deltaCell}>
          <RankDelta value={row.rankDelta} />
        </td>
      </tr>
    );
  }

  return (
    <>
      <PageHeader title={t('leaderboard:page.title')} subtitle={t('leaderboard:page.subtitle')} />

      <SeasonHeader
        season={season}
        onChange={setSeason}
        isCurrent={season.year === currentSeason.year && season.id === currentSeason.id}
      />

      {!participating && (
        <div className={styles.banner}>
          <span className={styles.bannerIcon}>
            <TrophyIcon width={18} height={18} />
          </span>
          <span className={styles.bannerText}>
            <span className={styles.bannerTitle}>{t('leaderboard:notParticipating.title')}</span>
            <span className={styles.bannerBody}>
              {wakatimeConnected
                ? t('leaderboard:notParticipating.text')
                : t('leaderboard:notParticipating.noWakatime')}
            </span>
          </span>
          <span className={styles.bannerAction}>
            {wakatimeConnected ? (
              <Button
                variant="primary"
                onClick={() => updateIntegrations({ leaderboard: { participating: true } })}
              >
                {t('leaderboard:notParticipating.cta')}
              </Button>
            ) : (
              <Button variant="primary" onClick={() => navigate('/integrations')}>
                {t('common:actions.connect')}
              </Button>
            )}
          </span>
        </div>
      )}

      <div className={styles.filters}>
        <Input
          className={styles.searchField}
          value={query}
          placeholder={t('leaderboard:filters.search')}
          leadingIcon={<SearchIcon width={15} height={15} />}
          aria-label={t('leaderboard:filters.search')}
          onChange={(event) => setQuery(event.target.value)}
        />

        <Select
          className={styles.filterSelect}
          value={specialty}
          aria-label={t('leaderboard:filters.specialty')}
          onChange={(event) => setSpecialty(event.target.value as SpecialtyId | '')}
        >
          <option value="">{t('leaderboard:filters.specialtyAll')}</option>
          {ALL_SPECIALTIES.map((item) => (
            <option key={item} value={item}>
              {t(`common:specialty.${item}`)}
            </option>
          ))}
        </Select>

        <Select
          className={styles.filterSelect}
          value={language}
          aria-label={t('leaderboard:filters.language')}
          onChange={(event) => setLanguage(event.target.value)}
        >
          <option value="">{t('leaderboard:filters.languageAll')}</option>
          {languages.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>

        <Select
          className={styles.filterSelect}
          value={country}
          aria-label={t('leaderboard:filters.country')}
          onChange={(event) => setCountry(event.target.value)}
        >
          <option value="">{t('leaderboard:filters.countryAll')}</option>
          {COUNTRIES.map((code) => (
            <option key={code} value={code}>
              {countryName(code, i18n.language)}
            </option>
          ))}
        </Select>

        {hasFilters && (
          <Button variant="ghost" onClick={resetFilters}>
            {t('leaderboard:filters.reset')}
          </Button>
        )}

        <span className={styles.filterCount}>
          {t('leaderboard:filters.found', { count: filtered.length })}
        </span>
      </div>

      <Card flush>
        {sorted.length === 0 ? (
          <EmptyState
            icon={<SearchIcon width={20} height={20} />}
            title={t('leaderboard:empty.title')}
            description={t('leaderboard:empty.description')}
            actions={<Button onClick={resetFilters}>{t('leaderboard:filters.reset')}</Button>}
          />
        ) : (
          <>
            <div className={styles.tableScroll}>
              <Table>
                <thead>
                  <tr>
                    <SortableHeader
                      label={t('leaderboard:columns.rank')}
                      active={sort.key === 'rank'}
                      direction={sort.direction}
                      onSort={() => toggleSort('rank')}
                    />
                    <th>{t('leaderboard:columns.user')}</th>
                    <th>{t('leaderboard:columns.specialty')}</th>
                    <SortableHeader
                      numeric
                      label={t('leaderboard:columns.hours')}
                      active={sort.key === 'seconds'}
                      direction={sort.direction}
                      onSort={() => toggleSort('seconds')}
                    />
                    <th>{t('leaderboard:columns.topLanguage')}</th>
                    <SortableHeader
                      label={t('leaderboard:columns.streak')}
                      active={sort.key === 'streak'}
                      direction={sort.direction}
                      onSort={() => toggleSort('streak')}
                    />
                    <th style={{ textAlign: 'right' }}>{t('leaderboard:columns.delta')}</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((row) => renderRow(row))}
                  {self && !selfVisible && renderRow(self, true)}
                </tbody>
              </Table>
            </div>

            {visible < sorted.length && (
              <div className={styles.footer}>
                <Button onClick={() => setVisible((value) => value + PAGE_SIZE)}>
                  {t('common:actions.showMore')}
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </>
  );
}

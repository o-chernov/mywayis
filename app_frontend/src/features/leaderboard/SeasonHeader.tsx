import { useTranslation } from 'react-i18next';

import {
  getDaysLeft,
  getRecentSeasons,
  getSeasonKey,
  getSeasonProgress,
} from '@/shared/lib/seasons';
import { useFormatters } from '@/shared/lib/useFormatters';
import { CalendarIcon } from '@/shared/icons';
import { ProgressBar, Select } from '@/shared/ui';
import type { Season } from '@/types';

import styles from './Leaderboard.module.css';

/** Подпись сезона: у зимы она охватывает два года — «Зима 2025/26». */
export function useSeasonLabel() {
  const { t } = useTranslation('common');
  return (season: Season) =>
    season.id === 'winter'
      ? t('seasons.winterLabel', { prev: season.year - 1, year: season.year })
      : `${t(`seasons.${season.id}`)} ${season.year}`;
}

interface SeasonHeaderProps {
  season: Season;
  onChange: (season: Season) => void;
  /** Текущий сезон отличается от выбранного — значит смотрим архив. */
  isCurrent: boolean;
}

export function SeasonHeader({ season, onChange, isCurrent }: SeasonHeaderProps) {
  const { t } = useTranslation(['leaderboard', 'common']);
  const formatters = useFormatters();
  const seasonLabel = useSeasonLabel();

  const options = getRecentSeasons(6);
  const progress = isCurrent ? getSeasonProgress(season) : 1;
  const daysLeft = getDaysLeft(season);

  return (
    <div className={styles.seasonHeader}>
      <div className={styles.seasonMain}>
        <span className={styles.seasonIcon}>
          <CalendarIcon width={18} height={18} />
        </span>

        <div className={styles.seasonText}>
          <span className={styles.seasonName}>{seasonLabel(season)}</span>
          <span className={styles.seasonRange}>
            {t('common:seasons.range', {
              start: formatters.date(season.start, { day: 'numeric', month: 'long' }),
              end: formatters.date(season.end, { day: 'numeric', month: 'long' }),
            })}
          </span>
        </div>

        <Select
          className={styles.seasonSelect}
          aria-label={t('leaderboard:season.selector')}
          value={getSeasonKey(season)}
          onChange={(event) => {
            const next = options.find((item) => getSeasonKey(item) === event.target.value);
            if (next) onChange(next);
          }}
        >
          {options.map((item, index) => (
            <option key={getSeasonKey(item)} value={getSeasonKey(item)}>
              {index === 0 ? `${seasonLabel(item)} · ${t('common:seasons.current')}` : seasonLabel(item)}
            </option>
          ))}
        </Select>
      </div>

      <div className={styles.seasonProgress}>
        <ProgressBar value={progress} size="thin" tone={isCurrent ? 'accent' : 'success'} />
        <span className={styles.seasonMeta}>
          {isCurrent
            ? `${t('leaderboard:season.progress', { percent: formatters.percent(progress) })} · ${t(
                'common:seasons.daysLeft',
                { days: formatters.days(daysLeft) },
              )}`
            : t('leaderboard:season.archived')}
        </span>
      </div>
    </div>
  );
}

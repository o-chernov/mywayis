import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  formatDate,
  formatDayLabel,
  formatDayMonth,
  formatMoney,
  formatNumber,
  formatPercent,
  formatRelative,
  formatSignedPercent,
  formatTime,
  formatTimeInZone,
  splitDuration,
} from './format';

/**
 * Форматтеры, привязанные к активной локали. Длительности склеиваются из
 * словаря, потому что русские единицы требуют склонения, а Intl.DurationFormat
 * поддержан ещё не везде.
 */
export function useFormatters() {
  const { t, i18n } = useTranslation('common');
  const locale = i18n.language;

  return useMemo(
    () => ({
      locale,

      /** Компактно для таблиц и подписей: «4 ч 32 м». */
      duration(seconds: number): string {
        const { hours, minutes } = splitDuration(seconds);
        if (hours === 0 && minutes === 0) return t('duration.zero');
        if (hours === 0) return t('duration.minutesShort', { count: minutes });
        if (minutes === 0) return t('duration.hoursShort', { count: hours });
        return t('duration.hoursMinutesShort', { hours, minutes });
      },

      /** Развёрнуто для текстовых выводов: «4 часа 32 минуты». */
      durationLong(seconds: number): string {
        const { hours, minutes } = splitDuration(seconds);
        if (hours === 0 && minutes === 0) return t('duration.zeroLong');
        if (hours === 0) return t('duration.minutesLong', { count: minutes });
        if (minutes === 0) return t('duration.hoursLong', { count: hours });
        return `${t('duration.hoursLong', { count: hours })} ${t('duration.minutesLong', { count: minutes })}`;
      },

      days: (count: number) => t('units.days', { count }),
      hours: (count: number) => t('units.hours', { count }),
      people: (count: number) => t('units.people', { count }),
      tags: (count: number) => t('units.tags', { count }),

      number: (value: number, options?: Intl.NumberFormatOptions) =>
        formatNumber(value, locale, options),
      percent: (value: number, digits?: number) => formatPercent(value, locale, digits),
      signedPercent: (value: number) => formatSignedPercent(value, locale),
      money: (value: number) => formatMoney(value, locale),

      date: (value: Date | string, options?: Intl.DateTimeFormatOptions) =>
        formatDate(value, locale, options),
      dayMonth: (value: Date | string) => formatDayMonth(value, locale),
      time: (value: Date | string, hour12?: boolean) => formatTime(value, locale, hour12),
      timeInZone: (timezone: string, hour12?: boolean) => formatTimeInZone(timezone, locale, hour12),
      relative: (value: Date | string) => formatRelative(value, locale),
      dayLabel: (value: Date | string) => formatDayLabel(value, locale),
    }),
    [locale, t],
  );
}

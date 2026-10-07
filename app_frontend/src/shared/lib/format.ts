/**
 * Форматирование чисел, дат и длительностей.
 *
 * Всё, что зависит от языка, идёт через Intl.* с явной локалью — никаких
 * захардкоженных «ч», «вчера» и разделителей разрядов. Единицы измерения,
 * требующие склонения, живут в словарях i18n (см. useFormatters).
 */

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function splitDuration(seconds: number): { hours: number; minutes: number } {
  const safe = Math.max(0, Math.round(seconds));
  return { hours: Math.floor(safe / HOUR), minutes: Math.floor((safe % HOUR) / MINUTE) };
}

/** Дробные часы для осей графиков: 16200 → 4.5 */
export function toHours(seconds: number, precision = 1): number {
  const factor = 10 ** precision;
  return Math.round((seconds / HOUR) * factor) / factor;
}

export function formatNumber(value: number, locale: string, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(locale, options).format(value);
}

export function formatPercent(value: number, locale: string, fractionDigits = 0) {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/** Знаковый процент для дельт: +12 % / −4 % */
export function formatSignedPercent(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 0,
    signDisplay: 'exceptZero',
  }).format(value);
}

export function formatDate(value: Date | string, locale: string, options?: Intl.DateTimeFormatOptions) {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat(
    locale,
    options ?? { day: 'numeric', month: 'long', year: 'numeric' },
  ).format(date);
}

export function formatDayMonth(value: Date | string, locale: string) {
  return formatDate(value, locale, { day: 'numeric', month: 'short' });
}

export function formatTime(value: Date | string, locale: string, hour12 = false) {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12 }).format(date);
}

/** Текущее время в чужом часовом поясе — для карточки пользователя. */
export function formatTimeInZone(timezone: string, locale: string, hour12 = false) {
  try {
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12,
      timeZone: timezone,
    }).format(new Date());
  } catch {
    return '—';
  }
}

/** «5 минут назад», «вчера» — единицу выбираем по величине разрыва. */
export function formatRelative(value: Date | string, locale: string, now: Date = new Date()) {
  const date = typeof value === 'string' ? new Date(value) : value;
  const diffSeconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const abs = Math.abs(diffSeconds);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (abs < MINUTE) return rtf.format(Math.round(diffSeconds), 'second');
  if (abs < HOUR) return rtf.format(Math.round(diffSeconds / MINUTE), 'minute');
  if (abs < DAY) return rtf.format(Math.round(diffSeconds / HOUR), 'hour');
  if (abs < 30 * DAY) return rtf.format(Math.round(diffSeconds / DAY), 'day');
  if (abs < 365 * DAY) return rtf.format(Math.round(diffSeconds / (30 * DAY)), 'month');
  return rtf.format(Math.round(diffSeconds / (365 * DAY)), 'year');
}

/** Метка дня для разделителей в переписке: сегодня / вчера / дата. */
export function formatDayLabel(value: Date | string, locale: string, now: Date = new Date()) {
  const date = typeof value === 'string' ? new Date(value) : value;
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOf(date) - startOf(now)) / (DAY * 1000));

  if (Math.abs(diffDays) <= 1) {
    return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(diffDays, 'day');
  }
  const sameYear = date.getFullYear() === now.getFullYear();
  return formatDate(date, locale, {
    day: 'numeric',
    month: 'long',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

export function formatMoney(value: number, locale: string, currency = 'RUB') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Инициалы для аватара-заглушки. */
export function getInitials(username: string): string {
  const cleaned = username.replace(/[^\p{L}\p{N}]/gu, '');
  return cleaned.slice(0, 2).toUpperCase();
}

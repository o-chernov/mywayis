import type { Season, SeasonId } from '@/types';

/**
 * Границы турнирных сезонов:
 *   зима   1 дек — 28/29 фев (пересекает новый год)
 *   весна  1 мар — 31 мая
 *   лето   1 июн — 31 авг
 *   осень  1 сен — 30 ноя
 *
 * `year` сезона — это год, в котором он ЗАВЕРШАЕТСЯ. Поэтому зима 1 дек 2025 —
 * 28 фев 2026 имеет year = 2026, а годовой зачёт — это ровно четыре сезона,
 * завершившиеся в календарном году. Итоги подводятся 1 декабря.
 *
 * Чистые функции без зависимостей: эту же логику потом повторит бэкенд.
 */

export const SEASON_ORDER: SeasonId[] = ['winter', 'spring', 'summer', 'autumn'];

const DAY_MS = 24 * 60 * 60 * 1000;

/** Последний день февраля с учётом високосного года. */
function februaryLastDay(year: number): number {
  return new Date(year, 1, 29).getMonth() === 1 ? 29 : 28;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

/** Границы сезона по идентификатору и году завершения. */
export function getSeasonBounds(id: SeasonId, year: number): { start: Date; end: Date } {
  switch (id) {
    case 'winter':
      // Начинается в декабре ПРЕДЫДУЩЕГО года.
      return {
        start: startOfDay(new Date(year - 1, 11, 1)),
        end: endOfDay(new Date(year, 1, februaryLastDay(year))),
      };
    case 'spring':
      return { start: startOfDay(new Date(year, 2, 1)), end: endOfDay(new Date(year, 4, 31)) };
    case 'summer':
      return { start: startOfDay(new Date(year, 5, 1)), end: endOfDay(new Date(year, 7, 31)) };
    case 'autumn':
      return { start: startOfDay(new Date(year, 8, 1)), end: endOfDay(new Date(year, 10, 30)) };
  }
}

export function makeSeason(id: SeasonId, year: number): Season {
  const { start, end } = getSeasonBounds(id, year);
  return { id, year, start, end };
}

/** Сезон, которому принадлежит дата. */
export function getSeason(date: Date = new Date()): Season {
  const month = date.getMonth();
  const year = date.getFullYear();

  if (month === 11) return makeSeason('winter', year + 1); // декабрь → зима следующего года
  if (month <= 1) return makeSeason('winter', year); // янв—фев → зима текущего
  if (month <= 4) return makeSeason('spring', year);
  if (month <= 7) return makeSeason('summer', year);
  return makeSeason('autumn', year);
}

/** Доля прошедшего времени сезона, 0…1. */
export function getSeasonProgress(season: Season, now: Date = new Date()): number {
  const total = season.end.getTime() - season.start.getTime();
  const passed = now.getTime() - season.start.getTime();
  return Math.min(1, Math.max(0, passed / total));
}

/** Полных дней до конца сезона; 0, если сезон уже закрыт. */
export function getDaysLeft(season: Season, now: Date = new Date()): number {
  const diff = season.end.getTime() - now.getTime();
  return diff <= 0 ? 0 : Math.ceil(diff / DAY_MS);
}

/** Четыре сезона, завершившиеся в указанном году — основа годового зачёта. */
export function getAnnualWindow(year: number): Season[] {
  return SEASON_ORDER.map((id) => makeSeason(id, year));
}

/** Предыдущий сезон относительно указанного. */
export function getPreviousSeason(season: Season): Season {
  const index = SEASON_ORDER.indexOf(season.id);
  if (index === 0) return makeSeason('autumn', season.year - 1);
  return makeSeason(SEASON_ORDER[index - 1], season.year);
}

/** Последние N сезонов, включая текущий, от свежего к старому. */
export function getRecentSeasons(count: number, now: Date = new Date()): Season[] {
  const seasons: Season[] = [];
  let cursor = getSeason(now);
  for (let i = 0; i < count; i += 1) {
    seasons.push(cursor);
    cursor = getPreviousSeason(cursor);
  }
  return seasons;
}

/**
 * Стабильный ключ сезона для URL и i18n: `2026-summer`.
 * У зимы подпись охватывает два года, но ключ остаётся по году завершения.
 */
export function getSeasonKey(season: Season): string {
  return `${season.year}-${season.id}`;
}

export function parseSeasonKey(key: string): Season | null {
  const [rawYear, rawId] = key.split('-');
  const year = Number(rawYear);
  if (!Number.isInteger(year) || !SEASON_ORDER.includes(rawId as SeasonId)) return null;
  return makeSeason(rawId as SeasonId, year);
}

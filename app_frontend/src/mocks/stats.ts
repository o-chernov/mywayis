import type { DailyActivity, DashboardStats, LanguageShare, ProjectShare } from '@/types';

import { seededRandom } from './users';

const HOUR = 3600;

/**
 * Генерируем правдоподобный ряд: будни плотные, выходные редкие, есть
 * несколько выпавших дней. Всё детерминировано — прототип не должен
 * «мерцать» новыми цифрами при каждом рендере.
 */
function generateDaily(days: number, seed: number, endDate: Date): DailyActivity[] {
  const random = seededRandom(seed);
  const result: DailyActivity[] = [];

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(endDate);
    date.setDate(date.getDate() - offset);
    date.setHours(0, 0, 0, 0);

    const weekday = date.getDay();
    const isWeekend = weekday === 0 || weekday === 6;
    const roll = random();

    let seconds: number;
    if (isWeekend) {
      seconds = roll < 0.45 ? 0 : Math.round((0.7 + random() * 2.4) * HOUR);
    } else if (roll < 0.06) {
      seconds = 0; // отпуск, болезнь, просто выходной среди недели
    } else {
      seconds = Math.round((3.4 + random() * 4.6) * HOUR);
    }

    result.push({ date: date.toISOString().slice(0, 10), seconds });
  }

  return result;
}

/** Распределение по часам суток: утренний и послеобеденный пики. */
function generateHourly(daily: DailyActivity[], seed: number): number[][] {
  const random = seededRandom(seed + 991);
  const grid: number[][] = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));

  // Вес часа: ночью почти ноль, пики в 11 и 16.
  const hourWeight = (hour: number) => {
    if (hour < 7) return 0.02;
    if (hour < 10) return 0.6;
    if (hour < 13) return 1.25;
    if (hour < 15) return 0.7;
    if (hour < 19) return 1.35;
    if (hour < 22) return 0.55;
    return 0.15;
  };

  daily.forEach((day) => {
    if (day.seconds === 0) return;
    // getDay(): 0 — воскресенье. Приводим к «понедельник первый».
    const jsDay = new Date(`${day.date}T00:00:00`).getDay();
    const row = (jsDay + 6) % 7;

    const weights = Array.from({ length: 24 }, (_, hour) => hourWeight(hour) * (0.6 + random()));
    const total = weights.reduce((sum, value) => sum + value, 0);

    weights.forEach((weight, hour) => {
      grid[row][hour] += Math.round((weight / total) * day.seconds);
    });
  });

  return grid;
}

function withShares(entries: Array<[string, number]>): LanguageShare[] {
  const total = entries.reduce((sum, [, seconds]) => sum + seconds, 0);
  return entries
    .map(([name, seconds]) => ({ name, seconds, share: seconds / total }))
    .sort((a, b) => b.seconds - a.seconds);
}

const PROJECTS: ProjectShare[] = [
  { name: 'myway-backend', seconds: 214000 },
  { name: 'myway-frontend', seconds: 168000 },
  { name: 'infra-playbooks', seconds: 61000 },
  { name: 'pet/telegram-bot', seconds: 42000 },
  { name: 'sandbox', seconds: 19000 },
];

/** Пропорционально ужимает распределение под фактическую сумму периода. */
function scaleShares(entries: LanguageShare[], totalSeconds: number): LanguageShare[] {
  const sum = entries.reduce((acc, item) => acc + item.seconds, 0);
  if (sum === 0) return entries;
  return entries.map((item) => ({
    ...item,
    seconds: Math.round((item.seconds / sum) * totalSeconds),
  }));
}

function scaleProjects(entries: ProjectShare[], totalSeconds: number): ProjectShare[] {
  const sum = entries.reduce((acc, item) => acc + item.seconds, 0);
  if (sum === 0) return entries;
  return entries.map((item) => ({
    ...item,
    seconds: Math.round((item.seconds / sum) * totalSeconds),
  }));
}

function longestStreak(daily: DailyActivity[]): number {
  let streak = 0;
  for (let i = daily.length - 1; i >= 0; i -= 1) {
    if (daily[i].seconds === 0) break;
    streak += 1;
  }
  return streak;
}

function bestOf(daily: DailyActivity[]): DailyActivity {
  return daily.reduce((best, day) => (day.seconds > best.seconds ? day : best), daily[0]);
}

export type PeriodId = 'today' | 'week' | 'month' | 'season';

export const PERIOD_DAYS: Record<PeriodId, number> = {
  today: 1,
  week: 7,
  month: 30,
  season: 73,
};

const LANGUAGE_MIX: Array<[string, number]> = [
  ['Python', 289000],
  ['TypeScript', 94000],
  ['SQL', 61000],
  ['Docker', 34000],
  ['CSS', 21000],
  ['Bash', 14000],
  ['YAML', 9000],
  ['Markdown', 6000],
];

/** Полная сводка дашборда за период. */
export function buildStats(period: PeriodId, now: Date = new Date()): DashboardStats {
  const days = PERIOD_DAYS[period];

  // Один и тот же seed на период — цифры не пляшут между переключениями.
  const daily = generateDaily(days, 20260812, now);
  const previous = generateDaily(days, 20260812 + days * 7, new Date(now.getTime() - days * 86400000));

  const totalSeconds = daily.reduce((sum, day) => sum + day.seconds, 0);
  const totalSecondsPrev = previous.reduce((sum, day) => sum + day.seconds, 0);
  const activeDays = daily.filter((day) => day.seconds > 0).length || 1;
  const activeDaysPrev = previous.filter((day) => day.seconds > 0).length || 1;

  return {
    totalSeconds,
    totalSecondsPrev,
    dailyAverageSeconds: Math.round(totalSeconds / activeDays),
    dailyAverageSecondsPrev: Math.round(totalSecondsPrev / activeDaysPrev),
    bestDay: bestOf(daily),
    bestDayPrev: bestOf(previous),
    currentStreak: longestStreak(daily),
    previousStreak: longestStreak(previous),
    daily,
    languages: scaleShares(withShares(LANGUAGE_MIX), totalSeconds),
    projects: scaleProjects(PROJECTS, totalSeconds),
    hourly: generateHourly(daily, 20260812),
    lastSyncedAt: new Date(now.getTime() - 7 * 60 * 1000).toISOString(),
  };
}

/** Короткий ряд для спарклайнов в карточках профиля и отчётах AI. */
export function buildSparkline(seed: number, points = 14): number[] {
  const random = seededRandom(seed);
  return Array.from({ length: points }, () => Math.round(random() * 100) / 10);
}

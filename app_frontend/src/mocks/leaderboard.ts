import type { LeaderboardEntry, UserProfile } from '@/types';

import { OTHER_USERS, seededRandom } from './users';

/**
 * Таблица сезона. Часы у каждого участника выводим из его языкового профиля,
 * чтобы «Топ-язык» и позиция не противоречили карточке пользователя.
 */
function totalSeconds(user: UserProfile): number {
  return user.languages.reduce((sum, item) => sum + item.seconds, 0);
}

function topLanguage(user: UserProfile): string {
  return user.languages.reduce((best, item) => (item.seconds > best.seconds ? item : best)).name;
}

export function buildLeaderboard(currentUser: UserProfile, includeSelf: boolean): LeaderboardEntry[] {
  const random = seededRandom(4242);

  const rows = OTHER_USERS.map((user) => ({
    user,
    seconds: totalSeconds(user),
  }));

  if (includeSelf) {
    rows.push({ user: currentUser, seconds: totalSeconds(currentUser) });
  }

  return rows
    .sort((a, b) => b.seconds - a.seconds)
    .map((row, index) => ({
      rank: index + 1,
      rankDelta: Math.round((random() - 0.5) * 8),
      user: {
        id: row.user.id,
        username: row.user.username,
        avatarUrl: row.user.avatarUrl,
        avatarColor: row.user.avatarColor,
        specialty: row.user.specialty,
        country: row.user.country,
        city: row.user.city,
      },
      seconds: row.seconds,
      topLanguage: topLanguage(row.user),
      streak: 2 + Math.round(random() * 26),
      isCurrentUser: row.user.id === currentUser.id,
    }));
}

/** Страны, встречающиеся в таблице — для фильтра. */
export const COUNTRIES = ['RU', 'BY', 'KZ', 'AM'] as const;

export const COUNTRY_NAMES: Record<string, { ru: string; en: string }> = {
  RU: { ru: 'Россия', en: 'Russia' },
  BY: { ru: 'Беларусь', en: 'Belarus' },
  KZ: { ru: 'Казахстан', en: 'Kazakhstan' },
  AM: { ru: 'Армения', en: 'Armenia' },
};

export function countryName(code: string | undefined, language: string): string {
  if (!code) return '—';
  const entry = COUNTRY_NAMES[code];
  if (!entry) return code;
  return language.startsWith('ru') ? entry.ru : entry.en;
}

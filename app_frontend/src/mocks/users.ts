import type { LanguageShare, SpecialtyId, UserProfile } from '@/types';

/** Детерминированный «шум» — чтобы моки были стабильны между перезагрузками. */
export function seededRandom(seed: number): () => number {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

const PALETTE = [
  'var(--viz-1)',
  'var(--viz-2)',
  'var(--viz-3)',
  'var(--viz-4)',
  'var(--viz-5)',
  'var(--viz-6)',
  'var(--viz-7)',
  'var(--viz-8)',
];

export function colorForUsername(username: string): string {
  const hash = Array.from(username).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return PALETTE[hash % PALETTE.length];
}

function languages(entries: Array<[string, number]>): LanguageShare[] {
  const total = entries.reduce((sum, [, seconds]) => sum + seconds, 0);
  return entries.map(([name, seconds]) => ({ name, seconds, share: seconds / total }));
}

interface SeedUser {
  username: string;
  specialty: SpecialtyId;
  country: string;
  city: string;
  timezone: string;
  langs: Array<[string, number]>;
  description?: string;
  joinedAt: string;
}

const SEED_USERS: SeedUser[] = [
  {
    username: 'kirill_dev',
    specialty: 'backend',
    country: 'RU',
    city: 'Москва',
    timezone: 'Europe/Moscow',
    langs: [
      ['Python', 372000],
      ['SQL', 96000],
      ['YAML', 41000],
      ['Bash', 22000],
    ],
    description:
      'Пишу highload на Python семь лет. Последний год копаю в сторону data engineering и потоковой обработки.',
    joinedAt: '2026-01-14T09:20:00Z',
  },
  {
    username: 'anna.codes',
    specialty: 'frontend',
    country: 'RU',
    city: 'Санкт-Петербург',
    timezone: 'Europe/Moscow',
    langs: [
      ['TypeScript', 318000],
      ['CSS', 128000],
      ['HTML', 54000],
      ['JavaScript', 31000],
    ],
    description: 'Дизайн-системы и доступность. Верю, что интерфейс без клавиатуры — не интерфейс.',
    joinedAt: '2025-11-03T12:00:00Z',
  },
  {
    username: 'maks_ops',
    specialty: 'devops',
    country: 'RU',
    city: 'Новосибирск',
    timezone: 'Asia/Novosibirsk',
    langs: [
      ['YAML', 214000],
      ['Bash', 165000],
      ['Go', 88000],
      ['HCL', 42000],
    ],
    joinedAt: '2026-02-20T07:45:00Z',
  },
  {
    username: 'dashadesign',
    specialty: 'design',
    country: 'RU',
    city: 'Казань',
    timezone: 'Europe/Moscow',
    langs: [
      ['Figma', 288000],
      ['CSS', 74000],
      ['HTML', 28000],
    ],
    description: 'Продуктовый дизайнер. Люблю таблицы, графики и всё, что плохо помещается на экран.',
    joinedAt: '2025-12-08T15:30:00Z',
  },
  {
    username: 'ivan_ml',
    specialty: 'data',
    country: 'RU',
    city: 'Екатеринбург',
    timezone: 'Asia/Yekaterinburg',
    langs: [
      ['Python', 402000],
      ['Jupyter', 122000],
      ['SQL', 78000],
      ['R', 19000],
    ],
    description: 'Рекомендательные системы в ретейле.',
    joinedAt: '2026-03-01T10:10:00Z',
  },
  {
    username: 'sergey.go',
    specialty: 'backend',
    country: 'BY',
    city: 'Минск',
    timezone: 'Europe/Minsk',
    langs: [
      ['Go', 341000],
      ['SQL', 62000],
      ['Docker', 38000],
    ],
    joinedAt: '2026-01-29T08:00:00Z',
  },
  {
    username: 'nastya_qa',
    specialty: 'qa',
    country: 'RU',
    city: 'Нижний Новгород',
    timezone: 'Europe/Moscow',
    langs: [
      ['Python', 186000],
      ['TypeScript', 94000],
      ['YAML', 33000],
    ],
    description: 'Автотесты и всё, что мешает багам доехать до прода.',
    joinedAt: '2026-04-12T11:25:00Z',
  },
  {
    username: 'roman_mobile',
    specialty: 'mobile',
    country: 'KZ',
    city: 'Алматы',
    timezone: 'Asia/Almaty',
    langs: [
      ['Kotlin', 259000],
      ['Swift', 141000],
      ['Dart', 47000],
    ],
    joinedAt: '2025-10-19T14:50:00Z',
  },
  {
    username: 'lena_fullstack',
    specialty: 'fullstack',
    country: 'RU',
    city: 'Краснодар',
    timezone: 'Europe/Moscow',
    langs: [
      ['TypeScript', 228000],
      ['Python', 174000],
      ['SQL', 66000],
      ['CSS', 44000],
    ],
    description: 'Делаю продукты от макета до деплоя. Небольшая студия, большие задачи.',
    joinedAt: '2026-02-05T09:00:00Z',
  },
  {
    username: 'pavel_rust',
    specialty: 'backend',
    country: 'RU',
    city: 'Томск',
    timezone: 'Asia/Tomsk',
    langs: [
      ['Rust', 297000],
      ['TOML', 31000],
      ['Bash', 24000],
    ],
    joinedAt: '2026-05-22T16:40:00Z',
  },
  {
    username: 'olya.frontend',
    specialty: 'frontend',
    country: 'RU',
    city: 'Самара',
    timezone: 'Europe/Samara',
    langs: [
      ['JavaScript', 204000],
      ['Vue', 118000],
      ['CSS', 71000],
    ],
    joinedAt: '2026-03-17T13:15:00Z',
  },
  {
    username: 'artem_java',
    specialty: 'backend',
    country: 'RU',
    city: 'Воронеж',
    timezone: 'Europe/Moscow',
    langs: [
      ['Java', 312000],
      ['Kotlin', 84000],
      ['SQL', 57000],
    ],
    description: 'Банковский бэкенд. Скучно, стабильно, интересно.',
    joinedAt: '2025-09-30T08:30:00Z',
  },
  {
    username: 'vika_design',
    specialty: 'design',
    country: 'RU',
    city: 'Владивосток',
    timezone: 'Asia/Vladivostok',
    langs: [
      ['Figma', 231000],
      ['CSS', 39000],
    ],
    joinedAt: '2026-04-02T06:20:00Z',
  },
  {
    username: 'gleb_devops',
    specialty: 'devops',
    country: 'AM',
    city: 'Ереван',
    timezone: 'Asia/Yerevan',
    langs: [
      ['Bash', 178000],
      ['YAML', 155000],
      ['Python', 61000],
    ],
    joinedAt: '2026-01-08T10:00:00Z',
  },
  {
    username: 'timur_ds',
    specialty: 'data',
    country: 'RU',
    city: 'Уфа',
    timezone: 'Asia/Yekaterinburg',
    langs: [
      ['Python', 268000],
      ['SQL', 112000],
      ['Jupyter', 63000],
    ],
    joinedAt: '2026-06-11T12:35:00Z',
  },
  {
    username: 'zhenya_php',
    specialty: 'backend',
    country: 'RU',
    city: 'Пермь',
    timezone: 'Asia/Yekaterinburg',
    langs: [
      ['PHP', 244000],
      ['SQL', 71000],
      ['JavaScript', 38000],
    ],
    joinedAt: '2026-02-27T09:45:00Z',
  },
  {
    username: 'alex_mobile',
    specialty: 'mobile',
    country: 'RU',
    city: 'Ростов-на-Дону',
    timezone: 'Europe/Moscow',
    langs: [
      ['Swift', 221000],
      ['Objective-C', 43000],
    ],
    joinedAt: '2026-05-04T15:00:00Z',
  },
  {
    username: 'marina_qa',
    specialty: 'qa',
    country: 'RU',
    city: 'Челябинск',
    timezone: 'Asia/Yekaterinburg',
    langs: [
      ['TypeScript', 163000],
      ['Python', 88000],
    ],
    joinedAt: '2026-03-28T11:05:00Z',
  },
  {
    username: 'nikita_fs',
    specialty: 'fullstack',
    country: 'RU',
    city: 'Калининград',
    timezone: 'Europe/Kaliningrad',
    langs: [
      ['TypeScript', 197000],
      ['Go', 121000],
      ['SQL', 48000],
    ],
    joinedAt: '2026-06-30T08:15:00Z',
  },
  {
    username: 'sofia_learns',
    specialty: 'other',
    country: 'RU',
    city: 'Тюмень',
    timezone: 'Asia/Yekaterinburg',
    langs: [
      ['Python', 96000],
      ['HTML', 42000],
      ['CSS', 31000],
    ],
    description: 'Меняю профессию. Пока учусь, но уже считаю часы.',
    joinedAt: '2026-07-15T17:20:00Z',
  },
];

export const OTHER_USERS: UserProfile[] = SEED_USERS.map((seed, index) => ({
  id: `u${index + 2}`,
  username: seed.username,
  email: `${seed.username.replace(/[^a-z0-9]/g, '')}@example.com`,
  avatarColor: colorForUsername(seed.username),
  specialty: seed.specialty,
  specialtyDescription: seed.description,
  country: seed.country,
  city: seed.city,
  timezone: seed.timezone,
  joinedAt: seed.joinedAt,
  plan: index % 4 === 0 ? 'pro' : 'free',
  languages: languages(seed.langs),
  lastSeenAt: new Date(Date.now() - (index + 1) * 37 * 60 * 1000).toISOString(),
}));

/** Профиль владельца кабинета. Специальность заполняется в онбординге. */
export const CURRENT_USER_BASE: UserProfile = {
  id: 'u1',
  username: 'oleg',
  email: 'oleg@mywayis.com',
  firstName: 'Олег',
  lastName: 'Чернов',
  avatarColor: 'var(--viz-1)',
  specialty: 'backend',
  specialtyDescription:
    'Собираю сервисы на Python и FastAPI. Сейчас строю MyWay — считаю чужие часы и свои заодно.',
  country: 'RU',
  city: 'Москва',
  timezone: 'Europe/Moscow',
  joinedAt: '2026-03-06T10:00:00Z',
  plan: 'free',
  languages: languages([
    ['Python', 289000],
    ['TypeScript', 94000],
    ['SQL', 61000],
    ['Docker', 34000],
    ['CSS', 21000],
    ['Bash', 14000],
  ]),
};

export function findUserByUsername(username: string): UserProfile | undefined {
  return OTHER_USERS.find((user) => user.username === username);
}

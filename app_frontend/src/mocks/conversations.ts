import type { Conversation, Message } from '@/types';

import { buildSparkline } from './stats';
import { OTHER_USERS } from './users';

export const AI_CONVERSATION_ID = 'c-ai';
export const SUPPORT_CONVERSATION_ID = 'c-support';

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60 * 1000).toISOString();
const hoursAgo = (hours: number) => minutesAgo(hours * 60);
const daysAgo = (days: number) => hoursAgo(days * 24);

const [kirill, anna, , dasha, ivan] = OTHER_USERS;

export function buildConversations(isPro: boolean): Conversation[] {
  return [
    {
      id: AI_CONVERSATION_ID,
      kind: 'ai',
      title: 'AI-агент MyWay',
      lastMessagePreview: isPro
        ? 'Отчёт за 11 августа: 6 ч 12 м, пик в 15:00'
        : 'Ежедневный разбор доступен на Pro',
      lastMessageAt: hoursAgo(9),
      unreadCount: isPro ? 1 : 0,
      muted: false,
      blocked: false,
      pinned: true,
    },
    {
      id: SUPPORT_CONVERSATION_ID,
      kind: 'support',
      title: 'Поддержка MyWay',
      lastMessagePreview: 'Проверили — синхронизация восстановилась. Дайте знать, если повторится',
      lastMessageAt: daysAgo(2),
      unreadCount: 0,
      muted: false,
      blocked: false,
      pinned: true,
    },
    {
      id: 'c-1',
      kind: 'user',
      participant: {
        id: anna.id,
        username: anna.username,
        avatarColor: anna.avatarColor,
        lastSeenAt: minutesAgo(14),
      },
      lastMessagePreview: 'Слушай, а как ты теги настраивал? У меня CSS не попадает в статистику',
      lastMessageAt: minutesAgo(23),
      unreadCount: 2,
      muted: false,
      blocked: false,
      pinned: false,
    },
    {
      id: 'c-2',
      kind: 'user',
      participant: {
        id: kirill.id,
        username: kirill.username,
        avatarColor: kirill.avatarColor,
        lastSeenAt: hoursAgo(3),
      },
      lastMessagePreview: 'Обгонишь меня к концу сезона — с меня кофе',
      lastMessageAt: hoursAgo(5),
      unreadCount: 0,
      muted: false,
      blocked: false,
      pinned: false,
    },
    {
      id: 'c-3',
      kind: 'user',
      participant: {
        id: ivan.id,
        username: ivan.username,
        avatarColor: ivan.avatarColor,
        lastSeenAt: hoursAgo(20),
      },
      lastMessagePreview: 'Скинул статью про профилирование, глянь на досуге',
      lastMessageAt: daysAgo(1),
      unreadCount: 0,
      muted: true,
      blocked: false,
      pinned: false,
    },
    {
      id: 'c-4',
      kind: 'user',
      participant: {
        id: dasha.id,
        username: dasha.username,
        avatarColor: dasha.avatarColor,
        lastSeenAt: daysAgo(4),
      },
      lastMessagePreview: 'Вы заблокировали этого пользователя',
      lastMessageAt: daysAgo(6),
      unreadCount: 0,
      muted: false,
      blocked: true,
      pinned: false,
    },
  ];
}

const ME = 'u1';

export function buildMessages(conversationId: string, isPro: boolean): Message[] {
  if (conversationId === AI_CONVERSATION_ID) return buildAiMessages(isPro);
  if (conversationId === SUPPORT_CONVERSATION_ID) return SUPPORT_MESSAGES;
  return USER_MESSAGES[conversationId] ?? [];
}

function buildAiMessages(isPro: boolean): Message[] {
  const reports: Message[] = [
    {
      id: 'ai-1',
      conversationId: AI_CONVERSATION_ID,
      authorId: 'ai',
      sentAt: daysAgo(3),
      read: true,
      report: {
        periodLabel: '9 августа',
        totalSeconds: 5 * 3600 + 47 * 60,
        deltaPercent: 0.12,
        topLanguage: 'Python',
        focusScore: 72,
        bullets: [
          'Три четверти времени ушло в myway-backend — самый сфокусированный день за неделю.',
          'Переключений между проектами всего 4, обычно 11. Это заметно лучше.',
          'Начали в 10:20 — на час позже привычного, но закончили в то же время.',
        ],
        sparkline: buildSparkline(11),
      },
    },
    {
      id: 'ai-2',
      conversationId: AI_CONVERSATION_ID,
      authorId: 'ai',
      sentAt: daysAgo(2),
      read: true,
      report: {
        periodLabel: '10 августа',
        totalSeconds: 3 * 3600 + 5 * 60,
        deltaPercent: -0.46,
        topLanguage: 'TypeScript',
        focusScore: 51,
        bullets: [
          'День короче обычного почти вдвое — суббота, это нормально.',
          'Впервые за две недели TypeScript обошёл Python.',
          'Длинных отрезков без переключений не было: максимум 22 минуты.',
        ],
        sparkline: buildSparkline(12),
      },
    },
    {
      id: 'ai-3',
      conversationId: AI_CONVERSATION_ID,
      authorId: 'ai',
      sentAt: hoursAgo(9),
      read: false,
      report: {
        periodLabel: '11 августа',
        totalSeconds: 6 * 3600 + 12 * 60,
        deltaPercent: 0.28,
        topLanguage: 'Python',
        focusScore: 81,
        bullets: [
          'Лучший понедельник за сезон: 6 ч 12 м против средних 4 ч 40 м.',
          'Пик пришёлся на 15:00–18:00 — как и в 7 из последних 10 продуктивных дней.',
          'До третьего места в сезоне осталось около 14 часов. При текущем темпе это 3 дня.',
        ],
        sparkline: buildSparkline(13),
        locked: !isPro,
      },
    },
  ];

  if (isPro) return reports;

  // На Free показываем историю, но свежий отчёт закрыт замком.
  return reports;
}

const SUPPORT_MESSAGES: Message[] = [
  {
    id: 's-1',
    conversationId: SUPPORT_CONVERSATION_ID,
    authorId: ME,
    text: 'Добрый день! Второй день не подтягивается статистика из WakaTime, последняя синхронизация была позавчера.',
    sentAt: daysAgo(3),
    read: true,
  },
  {
    id: 's-2',
    conversationId: SUPPORT_CONVERSATION_ID,
    authorId: 'support',
    text: 'Здравствуйте! Спасибо, что написали. Посмотрим логи по вашему аккаунту и вернёмся в течение пары часов.',
    sentAt: daysAgo(3),
    read: true,
  },
  {
    id: 's-3',
    conversationId: SUPPORT_CONVERSATION_ID,
    authorId: 'support',
    text: 'Проверили — на стороне WakaTime истёк API-ключ. Мы перезапустили синхронизацию, данные за пропущенные дни подтянулись. Дайте знать, если повторится.',
    sentAt: daysAgo(2),
    read: true,
  },
];

const USER_MESSAGES: Record<string, Message[]> = {
  'c-1': [
    {
      id: 'm-1',
      conversationId: 'c-1',
      authorId: 'u3',
      text: 'Привет! Увидела тебя в лидерборде, ты вроде тоже на FastAPI сидишь?',
      sentAt: daysAgo(2),
      read: true,
    },
    {
      id: 'm-2',
      conversationId: 'c-1',
      authorId: ME,
      text: 'Привет! Да, второй год. А ты по фронту, судя по профилю?',
      sentAt: daysAgo(2),
      read: true,
    },
    {
      id: 'm-3',
      conversationId: 'c-1',
      authorId: 'u3',
      text: 'Ага, дизайн-системы в основном. Кстати, вопрос не по теме.',
      sentAt: minutesAgo(25),
      read: false,
    },
    {
      id: 'm-4',
      conversationId: 'c-1',
      authorId: 'u3',
      text: 'Слушай, а как ты теги настраивал? У меня CSS не попадает в статистику, хотя я в нём полдня сижу.',
      sentAt: minutesAgo(23),
      read: false,
    },
  ],
  'c-2': [
    {
      id: 'm-5',
      conversationId: 'c-2',
      authorId: 'u2',
      text: 'Видел, ты за неделю почти 30 часов набил. Это отпуск закончился или новый проект?',
      sentAt: hoursAgo(7),
      read: true,
    },
    {
      id: 'm-6',
      conversationId: 'c-2',
      authorId: ME,
      text: 'Новый проект. Пилю личный кабинет, там работы на месяц вперёд.',
      sentAt: hoursAgo(6),
      read: true,
    },
    {
      id: 'm-7',
      conversationId: 'c-2',
      authorId: 'u2',
      text: 'Обгонишь меня к концу сезона — с меня кофе ☕',
      sentAt: hoursAgo(5),
      read: true,
    },
  ],
  'c-3': [
    {
      id: 'm-8',
      conversationId: 'c-3',
      authorId: 'u6',
      text: 'Скинул статью про профилирование в Python, глянь на досуге — там про py-spy интересно.',
      sentAt: daysAgo(1),
      read: true,
    },
  ],
  'c-4': [
    {
      id: 'm-9',
      conversationId: 'c-4',
      authorId: 'u5',
      text: 'Привет! Продвигаю курс по дизайну, тебе может быть интересно.',
      sentAt: daysAgo(6),
      read: true,
    },
  ],
};

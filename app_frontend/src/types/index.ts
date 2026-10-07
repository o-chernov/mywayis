export type Persona = 'new' | 'free' | 'pro';

export type Plan = 'free' | 'pro';

export type SpecialtyId =
  | 'backend'
  | 'frontend'
  | 'fullstack'
  | 'mobile'
  | 'devops'
  | 'data'
  | 'qa'
  | 'design'
  | 'other';

export type SeasonId = 'winter' | 'spring' | 'summer' | 'autumn';

export interface Season {
  id: SeasonId;
  /** Год, в котором сезон ЗАВЕРШАЕТСЯ. Зима 1 дек 2025 — 28 фев 2026 → year = 2026. */
  year: number;
  start: Date;
  end: Date;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  /** Инициалы-фолбэк, когда аватара нет. */
  avatarColor: string;
  specialty: SpecialtyId | null;
  specialtyDescription?: string;
  country?: string;
  city?: string;
  timezone: string;
  joinedAt: string;
  plan: Plan;
  languages: LanguageShare[];
  lastSeenAt?: string;
}

export interface LanguageShare {
  name: string;
  seconds: number;
  share: number;
}

export interface ProjectShare {
  name: string;
  seconds: number;
}

export interface DailyActivity {
  date: string;
  seconds: number;
}

export interface DashboardStats {
  totalSeconds: number;
  totalSecondsPrev: number;
  dailyAverageSeconds: number;
  dailyAverageSecondsPrev: number;
  bestDay: DailyActivity;
  bestDayPrev: DailyActivity;
  currentStreak: number;
  previousStreak: number;
  daily: DailyActivity[];
  languages: LanguageShare[];
  projects: ProjectShare[];
  /** 7 рядов (пн—вс) × 24 столбца, значения в секундах. */
  hourly: number[][];
  lastSyncedAt: string;
}

export type IntegrationId = 'wakatime' | 'leaderboard' | 'ai-agent';

export type IntegrationStatus = 'connected' | 'disconnected' | 'error';

export interface IntegrationState {
  wakatime: {
    status: IntegrationStatus;
    connectedAt?: string;
    lastSyncedAt?: string;
    apiKeyMask?: string;
    errorMessage?: string;
  };
  leaderboard: {
    participating: boolean;
  };
  aiAgent: {
    enabled: boolean;
  };
  trackedTags: string[];
}

export type TagCategory = 'language' | 'tool' | 'offtopic';

export interface TagOption {
  id: string;
  label: string;
  category: TagCategory;
}

export interface LeaderboardEntry {
  rank: number;
  /** Изменение позиции за неделю: положительное — поднялся. */
  rankDelta: number;
  user: Pick<
    UserProfile,
    'id' | 'username' | 'avatarUrl' | 'avatarColor' | 'specialty' | 'country' | 'city'
  >;
  seconds: number;
  topLanguage: string;
  streak: number;
  isCurrentUser?: boolean;
}

export type ConversationKind = 'user' | 'support' | 'ai';

export interface Conversation {
  id: string;
  kind: ConversationKind;
  /** Есть только у kind === 'user'. */
  participant?: Pick<UserProfile, 'id' | 'username' | 'avatarUrl' | 'avatarColor' | 'lastSeenAt'>;
  title?: string;
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCount: number;
  muted: boolean;
  blocked: boolean;
  pinned: boolean;
}

export interface AiReportPayload {
  periodLabel: string;
  totalSeconds: number;
  deltaPercent: number;
  topLanguage: string;
  focusScore: number;
  bullets: string[];
  sparkline: number[];
  /** Отчёты, доступные только на Pro, приходят с флагом «заблокировано». */
  locked?: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  authorId: string;
  /** Обычное текстовое сообщение. */
  text?: string;
  /** Карточка-отчёт AI-агента вместо текста. */
  report?: AiReportPayload;
  sentAt: string;
  read: boolean;
}

export interface NotificationSettings {
  newMessages: { email: boolean; inApp: boolean };
  aiReports: { email: boolean; inApp: boolean };
  rankChanges: { email: boolean; inApp: boolean };
  seasonEnd: { email: boolean; inApp: boolean };
  globalQuiet: boolean;
  quietFrom: string;
  quietTo: string;
}

export type WhoCanMessage = 'everyone' | 'participants' | 'nobody';

export interface PrivacySettings {
  publicProfile: boolean;
  showLocation: boolean;
  whoCanMessage: WhoCanMessage;
  blockedUserIds: string[];
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  period: 'month' | 'year';
  status: 'paid' | 'refunded' | 'failed';
  provider: string;
}

export interface SubscriptionState {
  plan: Plan;
  renewsAt?: string;
  provider?: string;
  payments: Payment[];
}

import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import enAuth from './locales/en/auth.json';
import enCommon from './locales/en/common.json';
import enDashboard from './locales/en/dashboard.json';
import enIntegrations from './locales/en/integrations.json';
import enLeaderboard from './locales/en/leaderboard.json';
import enMessages from './locales/en/messages.json';
import enOnboarding from './locales/en/onboarding.json';
import enProfile from './locales/en/profile.json';
import enSettings from './locales/en/settings.json';
import ruAuth from './locales/ru/auth.json';
import ruCommon from './locales/ru/common.json';
import ruDashboard from './locales/ru/dashboard.json';
import ruIntegrations from './locales/ru/integrations.json';
import ruLeaderboard from './locales/ru/leaderboard.json';
import ruMessages from './locales/ru/messages.json';
import ruOnboarding from './locales/ru/onboarding.json';
import ruProfile from './locales/ru/profile.json';
import ruSettings from './locales/ru/settings.json';

export const SUPPORTED_LANGUAGES = ['ru', 'en'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const NAMESPACES = [
  'common',
  'auth',
  'dashboard',
  'integrations',
  'leaderboard',
  'profile',
  'messages',
  'settings',
  'onboarding',
] as const;

const resources = {
  ru: {
    common: ruCommon,
    auth: ruAuth,
    dashboard: ruDashboard,
    integrations: ruIntegrations,
    leaderboard: ruLeaderboard,
    profile: ruProfile,
    messages: ruMessages,
    settings: ruSettings,
    onboarding: ruOnboarding,
  },
  en: {
    common: enCommon,
    auth: enAuth,
    dashboard: enDashboard,
    integrations: enIntegrations,
    leaderboard: enLeaderboard,
    profile: enProfile,
    messages: enMessages,
    settings: enSettings,
    onboarding: enOnboarding,
  },
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ru',
    supportedLngs: SUPPORTED_LANGUAGES,
    // Держим только базовые коды: ru-RU и ru должны попасть в один словарь.
    load: 'languageOnly',
    ns: NAMESPACES,
    defaultNS: 'common',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'myway.language',
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
    returnNull: false,
  });

/** Держим lang на <html> в актуальном состоянии — важно для переносов и a11y. */
i18n.on('languageChanged', (lng) => {
  document.documentElement.setAttribute('lang', lng);
});

export default i18n;

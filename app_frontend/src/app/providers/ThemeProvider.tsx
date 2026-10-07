import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

import { readStorage, writeStorage } from '@/shared/lib/storage';

export type ThemeMode = 'system' | 'dark' | 'light';
export type ResolvedTheme = 'dark' | 'light';

interface ThemeContextValue {
  mode: ThemeMode;
  /** Что реально применено к документу — с учётом системной настройки. */
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'theme';
const LIGHT_QUERY = '(prefers-color-scheme: light)';

/**
 * Системная тема — внешний источник данных, поэтому читаем её через
 * useSyncExternalStore, а не копируем в состояние эффектом.
 */
function subscribeToSystemTheme(onChange: () => void): () => void {
  const media = window.matchMedia(LIGHT_QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

function getSystemPrefersLight(): boolean {
  return window.matchMedia(LIGHT_QUERY).matches;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() =>
    readStorage<ThemeMode>(STORAGE_KEY, 'dark'),
  );

  const systemPrefersLight = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemPrefersLight,
    () => false,
  );

  const resolved: ResolvedTheme =
    mode === 'system' ? (systemPrefersLight ? 'light' : 'dark') : mode;

  // Единственный побочный эффект — синхронизация атрибута на <html>,
  // от которого зависят все токены.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolved);
  }, [resolved]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    writeStorage(STORAGE_KEY, next);
  }, []);

  const toggle = useCallback(() => {
    setMode(resolved === 'dark' ? 'light' : 'dark');
  }, [resolved, setMode]);

  const value = useMemo(
    () => ({ mode, resolved, setMode, toggle }),
    [mode, resolved, setMode, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme должен вызываться внутри ThemeProvider');
  return context;
}

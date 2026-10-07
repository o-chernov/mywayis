import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib/cn';
import { AlertIcon, CheckIcon, CloseIcon, InfoIcon } from '@/shared/icons';
import { IconButton } from '@/shared/ui/IconButton/IconButton';

import styles from '@/shared/ui/Toast/Toast.module.css';

type ToastTone = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
  description?: string;
}

interface ToastContextValue {
  toast: (message: string, options?: { tone?: ToastTone; description?: string }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_ICON: Record<ToastTone, ReactNode> = {
  success: <CheckIcon />,
  error: <AlertIcon />,
  info: <InfoIcon />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation('common');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback<ToastContextValue['toast']>(
    (message, options) => {
      const id = nextId.current;
      nextId.current += 1;
      setToasts((current) => [
        ...current,
        { id, message, tone: options?.tone ?? 'success', description: options?.description },
      ]);
      window.setTimeout(() => dismiss(id), 4000);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.viewport} role="region" aria-live="polite" aria-label={t('a11y.notifications')}>
        {toasts.map((item) => (
          <div key={item.id} className={cn(styles.toast, styles[item.tone])}>
            <span className={styles.icon}>{TONE_ICON[item.tone]}</span>
            <span className={styles.text}>
              {item.message}
              {item.description && <span className={styles.description}>{item.description}</span>}
            </span>
            <IconButton label={t('actions.close')} size="sm" onClick={() => dismiss(item.id)}>
              <CloseIcon width={13} height={13} />
            </IconButton>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast должен вызываться внутри ToastProvider');
  return context;
}

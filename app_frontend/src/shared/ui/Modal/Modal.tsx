import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib/cn';
import { CloseIcon } from '@/shared/icons';
import { IconButton } from '@/shared/ui/IconButton/IconButton';

import styles from './Modal.module.css';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  iconTone?: 'accent' | 'warning' | 'danger';
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Обязательный шаг: нельзя закрыть ни Esc, ни кликом по подложке, ни
   * крестиком. Используется модалкой установки специальности.
   */
  mandatory?: boolean;
  children?: ReactNode;
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  iconTone = 'accent',
  footer,
  size = 'md',
  mandatory = false,
  children,
}: ModalProps) {
  const { t } = useTranslation('common');
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Блокировка скролла страницы, пока модалка открыта.
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Фокус внутрь при открытии и возврат туда, откуда пришли.
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const node = dialogRef.current;
    const first = node?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? node)?.focus();

    return () => {
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  // Esc закрывает, Tab не выпускает фокус за пределы диалога.
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !mandatory) {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [],
      ).filter((el) => el.offsetParent !== null);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [open, onClose, mandatory]);

  if (!open) return null;

  const root = document.getElementById('modal-root');
  if (!root) return null;

  const hasHeader = Boolean(title || subtitle);

  return createPortal(
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (!mandatory && event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={cn(styles.dialog, styles[size])}
      >
        {hasHeader && (
          <div className={styles.header}>
            {icon && (
              <span
                className={cn(
                  styles.icon,
                  iconTone === 'danger' && styles.iconDanger,
                  iconTone === 'warning' && styles.iconWarning,
                  iconTone === 'accent' && styles.iconAccent,
                )}
              >
                {icon}
              </span>
            )}
            <div className={styles.headerText}>
              {title && (
                <h2 className={styles.title} id={titleId}>
                  {title}
                </h2>
              )}
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
            {!mandatory && (
              <IconButton
                label={t('a11y.closeDialog')}
                size="sm"
                className={styles.closeButton}
                onClick={onClose}
              >
                <CloseIcon />
              </IconButton>
            )}
          </div>
        )}

        {children && (
          <div className={cn(styles.body, !hasHeader && styles.bodyOnly)}>{children}</div>
        )}
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>,
    root,
  );
}

export { styles as modalStyles };

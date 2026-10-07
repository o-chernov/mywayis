import { useEffect, useRef, useState, type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

import styles from './Menu.module.css';

interface MenuProps {
  /** Кнопка-триггер. Получает состояние, чтобы отрисовать активный вид. */
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode;
  align?: 'start' | 'end';
  children: (props: { close: () => void }) => ReactNode;
  className?: string;
}

export function Menu({ trigger, align = 'end', children, className }: MenuProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Закрываем по клику вне и по Esc.
  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className={cn(styles.wrapper, className)} ref={wrapperRef}>
      {trigger({ open, toggle: () => setOpen((value) => !value) })}
      {open && (
        <div
          className={cn(styles.dropdown, align === 'end' ? styles.alignEnd : styles.alignStart)}
          role="menu"
        >
          {children({ close: () => setOpen(false) })}
        </div>
      )}
    </div>
  );
}

interface MenuItemProps {
  onClick?: () => void;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  trailing?: ReactNode;
  children: ReactNode;
}

export function MenuItem({
  onClick,
  icon,
  danger = false,
  disabled = false,
  trailing,
  children,
}: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      className={cn(styles.item, danger && styles.danger)}
      disabled={disabled}
      onClick={onClick}
    >
      {icon}
      {children}
      {trailing && <span className={styles.trailing}>{trailing}</span>}
    </button>
  );
}

export function MenuSeparator() {
  return <div className={styles.separator} role="separator" />;
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return <div className={styles.label}>{children}</div>;
}

import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

import styles from './Card.module.css';

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Заголовок карточки. Если не задан, шапка не рисуется. */
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  /** Убрать внутренние отступы тела — для таблиц во всю ширину. */
  flush?: boolean;
  /** Карточка без шапки, но с отступами. */
  padded?: boolean;
}

export function Card({
  title,
  subtitle,
  actions,
  flush = false,
  padded = false,
  className,
  children,
  ...rest
}: CardProps) {
  const hasHeader = Boolean(title || actions);

  return (
    <div className={cn(styles.card, !hasHeader && padded && styles.padded, className)} {...rest}>
      {hasHeader && (
        <div className={styles.header}>
          <div className={styles.headerText}>
            {title && <span className={styles.title}>{title}</span>}
            {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
      {hasHeader ? (
        <div className={cn(styles.body, flush && styles.bodyFlush)}>{children}</div>
      ) : (
        children
      )}
    </div>
  );
}

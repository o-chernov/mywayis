import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

import styles from './EmptyState.module.css';

interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  compact?: boolean;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actions,
  compact = false,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(styles.empty, compact && styles.compact, className)}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.title}>{title}</span>
      {description && <p className={styles.description}>{description}</p>}
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}

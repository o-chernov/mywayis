import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

import styles from './Tabs.module.css';

export interface TabItem<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
  /** Счётчик справа: непрочитанные, количество элементов. */
  badge?: number;
}

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  ariaLabel,
  orientation = 'horizontal',
  className,
}: TabsProps<T>) {
  return (
    <div
      className={cn(styles.list, orientation === 'vertical' && styles.vertical, className)}
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation={orientation}
    >
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={item.value === value}
          className={cn(styles.tab, item.value === value && styles.active)}
          onClick={() => onChange(item.value)}
        >
          {item.icon}
          {item.label}
          {item.badge !== undefined && item.badge > 0 && (
            <span className={styles.badge}>{item.badge}</span>
          )}
        </button>
      ))}
    </div>
  );
}

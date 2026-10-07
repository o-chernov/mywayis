import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib/cn';
import { ArrowDownIcon, ArrowUpIcon } from '@/shared/icons';

import styles from './Table.module.css';

export function Table({
  children,
  hoverable = true,
  className,
}: {
  children: ReactNode;
  hoverable?: boolean;
  className?: string;
}) {
  return (
    <div className={styles.wrapper}>
      <table className={cn(styles.table, hoverable && styles.hoverable, className)}>
        {children}
      </table>
    </div>
  );
}

interface SortableHeaderProps {
  label: string;
  active: boolean;
  direction: 'asc' | 'desc';
  onSort: () => void;
  numeric?: boolean;
}

export function SortableHeader({
  label,
  active,
  direction,
  onSort,
  numeric = false,
}: SortableHeaderProps) {
  const { t } = useTranslation('common');

  return (
    <th
      className={cn(numeric && styles.numeric)}
      aria-sort={active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button
        type="button"
        className={cn(styles.sortButton, active && styles.sortActive)}
        onClick={onSort}
        title={t('a11y.sortBy', { column: label })}
      >
        {label}
        {active && direction === 'asc' ? (
          <ArrowUpIcon className={styles.sortIcon} width={12} height={12} />
        ) : (
          <ArrowDownIcon className={styles.sortIcon} width={12} height={12} />
        )}
      </button>
    </th>
  );
}

export { styles as tableStyles };

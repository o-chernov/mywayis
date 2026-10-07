import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';
import { CloseIcon } from '@/shared/icons';

import styles from './Chip.module.css';

interface ChipProps {
  children: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  /** Клик по самому чипу — переключение выбора. */
  onClick?: () => void;
  /** Отдельный крестик — используется для активных фильтров. */
  onRemove?: () => void;
  removeLabel?: string;
  /** Цветная метка слева — цвет языка в легенде графика. */
  color?: string;
  /** Правая приписка: процент или количество. */
  count?: ReactNode;
  className?: string;
}

export function Chip({
  children,
  selected = false,
  disabled = false,
  onClick,
  onRemove,
  removeLabel,
  color,
  count,
  className,
}: ChipProps) {
  const content = (
    <>
      {color && <span className={styles.dot} style={{ background: color }} aria-hidden="true" />}
      {children}
      {count !== undefined && <span className={styles.count}>{count}</span>}
      {onRemove && (
        <span
          role="button"
          tabIndex={0}
          aria-label={removeLabel}
          className={styles.remove}
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              event.stopPropagation();
              onRemove();
            }
          }}
        >
          <CloseIcon width={11} height={11} />
        </span>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={cn(styles.chip, styles.interactive, selected && styles.selected, className)}
        disabled={disabled}
        aria-pressed={selected}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return (
    <span className={cn(styles.chip, selected && styles.selected, className)}>{content}</span>
  );
}

import { cn } from '@/shared/lib/cn';

import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  /** Доля от 0 до 1. */
  value: number;
  tone?: 'accent' | 'success' | 'warning' | 'danger';
  size?: 'thin' | 'md' | 'thick';
  ariaLabel?: string;
  className?: string;
}

export function ProgressBar({
  value,
  tone = 'accent',
  size = 'md',
  ariaLabel,
  className,
}: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, value));

  return (
    <div
      className={cn(
        styles.track,
        size !== 'md' && styles[size],
        tone !== 'accent' && styles[tone],
        className,
      )}
      role="progressbar"
      aria-valuenow={Math.round(clamped * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
    >
      <div className={styles.fill} style={{ width: `${clamped * 100}%` }} />
    </div>
  );
}

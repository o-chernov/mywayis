import { cn } from '@/shared/lib/cn';

import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  variant?: 'block' | 'text' | 'circle';
  className?: string;
}

export function Skeleton({ width, height, variant = 'block', className }: SkeletonProps) {
  return (
    <span
      className={cn(
        styles.skeleton,
        variant === 'text' && styles.text,
        variant === 'circle' && styles.circle,
        className,
      )}
      style={{ width, height, display: 'block' }}
      aria-hidden="true"
    />
  );
}

import { cn } from '@/shared/lib/cn';
import { getInitials } from '@/shared/lib/format';

import styles from './Avatar.module.css';

interface AvatarProps {
  username: string;
  src?: string;
  /** Цвет подложки для инициалов — приходит вместе с профилем. */
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  ring?: boolean;
  className?: string;
}

export function Avatar({
  username,
  src,
  color = 'var(--viz-8)',
  size = 'md',
  ring = false,
  className,
}: AvatarProps) {
  return (
    <span
      className={cn(styles.avatar, styles[size], ring && styles.ring, className)}
      style={{ background: src ? 'transparent' : color }}
      aria-hidden="true"
    >
      {src ? <img className={styles.image} src={src} alt="" /> : getInitials(username)}
    </span>
  );
}

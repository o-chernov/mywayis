import { useId, useState, type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

import styles from './Tooltip.module.css';

interface TooltipProps {
  content: ReactNode;
  placement?: 'top' | 'bottom';
  children: ReactNode;
  className?: string;
}

/**
 * Подсказка по наведению и фокусу. Показываем и по focus тоже — иначе она
 * недоступна с клавиатуры.
 */
export function Tooltip({ content, placement = 'top', children, className }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  if (!content) return <>{children}</>;

  return (
    <span
      className={cn(styles.wrapper, className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      aria-describedby={visible ? id : undefined}
    >
      {children}
      {visible && (
        <span className={cn(styles.bubble, placement === 'bottom' && styles.bottom)} role="tooltip" id={id}>
          {content}
        </span>
      )}
    </span>
  );
}

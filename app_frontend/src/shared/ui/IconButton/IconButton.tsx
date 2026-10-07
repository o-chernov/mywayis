import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

import styles from './IconButton.module.css';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Обязательно: у кнопки-иконки нет текста, читать её нечем. */
  label: string;
  size?: 'sm' | 'md';
  bordered?: boolean;
  active?: boolean;
}

export function IconButton({
  label,
  size = 'md',
  bordered = false,
  active = false,
  className,
  children,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        styles.iconButton,
        styles[size],
        bordered && styles.bordered,
        active && styles.active,
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

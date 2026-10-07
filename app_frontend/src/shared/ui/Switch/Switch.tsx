import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

import styles from './Switch.module.css';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  /** Растянуть на всю ширину: текст слева, тумблер справа. */
  spread?: boolean;
  /** Заменяет label для тумблеров без видимой подписи. */
  ariaLabel?: string;
  title?: string;
  className?: string;
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  spread = false,
  ariaLabel,
  title,
  className,
}: SwitchProps) {
  const control = (
    <>
      <input
        type="checkbox"
        role="switch"
        className={styles.input}
        checked={checked}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className={styles.track} aria-hidden="true">
        <span className={styles.thumb} />
      </span>
    </>
  );

  const text = (label || description) && (
    <span className={styles.text}>
      {label && <span className={styles.label}>{label}</span>}
      {description && <span className={styles.description}>{description}</span>}
    </span>
  );

  if (spread) {
    return (
      <label
        className={cn(styles.wrapper, styles.spread, disabled && styles.disabled, className)}
        title={title}
      >
        {text}
        <span style={{ display: 'inline-flex', flexShrink: 0 }}>{control}</span>
      </label>
    );
  }

  return (
    <label className={cn(styles.wrapper, disabled && styles.disabled, className)} title={title}>
      {control}
      {text}
    </label>
  );
}

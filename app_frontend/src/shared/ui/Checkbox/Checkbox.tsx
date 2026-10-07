import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';
import { CheckIcon } from '@/shared/icons';

import styles from './Checkbox.module.css';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}

export function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  ariaLabel,
  className,
}: CheckboxProps) {
  return (
    <label className={cn(styles.wrapper, disabled && styles.disabled, className)}>
      <input
        type="checkbox"
        className={styles.input}
        checked={checked}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className={styles.box} aria-hidden="true">
        <CheckIcon className={styles.check} />
      </span>
      {label}
    </label>
  );
}

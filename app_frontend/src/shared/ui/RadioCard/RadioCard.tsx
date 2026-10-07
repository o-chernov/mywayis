import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

import styles from './RadioCard.module.css';

interface RadioCardProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  title: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

/**
 * Радио-карточка вместо голого radio там, где выбор осмысленный и требует
 * пояснения — например «участвовать в турнире?».
 */
export function RadioCard({
  name,
  value,
  checked,
  onChange,
  title,
  description,
  disabled = false,
}: RadioCardProps) {
  return (
    <label className={cn(styles.card, checked && styles.selected, disabled && styles.disabled)}>
      <input
        type="radio"
        className={styles.input}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
      />
      <span className={styles.marker} aria-hidden="true" />
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        {description && <span className={styles.description}>{description}</span>}
      </span>
    </label>
  );
}

export function RadioCardGroup({
  legend,
  children,
}: {
  legend: string;
  children: ReactNode;
}) {
  return (
    <fieldset className={styles.group}>
      <legend className="srOnly">{legend}</legend>
      {children}
    </fieldset>
  );
}

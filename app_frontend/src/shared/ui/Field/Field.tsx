import { useId, type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

import styles from './Field.module.css';

interface FieldProps {
  label?: ReactNode;
  /** Подпись «необязательно» рядом с меткой. */
  optionalLabel?: string;
  /** Правый верхний угол: счётчик символов и подобное. */
  aside?: ReactNode;
  hint?: ReactNode;
  error?: string;
  className?: string;
  /** Получает id и aria-атрибуты для связки метки, подсказки и ошибки. */
  children: (props: {
    id: string;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean;
  }) => ReactNode;
}

export function Field({
  label,
  optionalLabel,
  aside,
  hint,
  error,
  className,
  children,
}: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ');

  return (
    <div className={cn(styles.field, className)}>
      {(label || aside) && (
        <div className={styles.labelRow}>
          {label && (
            <label className={styles.label} htmlFor={id}>
              {label}
              {optionalLabel && <span className={styles.optional}> — {optionalLabel}</span>}
            </label>
          )}
          {aside && <span className={styles.aside}>{aside}</span>}
        </div>
      )}

      {children({
        id,
        'aria-describedby': describedBy || undefined,
        'aria-invalid': error ? true : undefined,
      })}

      {hint && !error && (
        <span className={styles.hint} id={hintId}>
          {hint}
        </span>
      )}
      {error && (
        <span className={styles.error} id={errorId} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export { styles as fieldStyles };

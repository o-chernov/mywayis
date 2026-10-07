import type { SelectHTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';
import { fieldStyles } from '@/shared/ui/Field/Field';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

/**
 * Нативный select. Для прототипа этого достаточно: он бесплатно получает
 * клавиатуру, скринридеры и поиск по первым буквам.
 */
export function Select({ invalid, className, children, ...rest }: SelectProps) {
  return (
    <select
      className={cn(
        fieldStyles.control,
        fieldStyles.select,
        invalid && fieldStyles.invalid,
        className,
      )}
      {...rest}
    >
      {children}
    </select>
  );
}

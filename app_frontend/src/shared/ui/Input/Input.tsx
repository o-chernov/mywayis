import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';
import { fieldStyles } from '@/shared/ui/Field/Field';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  /** Кнопка справа внутри поля — «показать пароль», «очистить». */
  adornment?: ReactNode;
  /** Иконка слева — лупа в поиске. */
  leadingIcon?: ReactNode;
}

export function Input({ invalid, adornment, leadingIcon, className, ...rest }: InputProps) {
  const input = (
    <input
      className={cn(fieldStyles.control, invalid && fieldStyles.invalid, className)}
      {...rest}
    />
  );

  if (!adornment && !leadingIcon) return input;

  return (
    <div className={cn(fieldStyles.withAdornment, Boolean(leadingIcon) && fieldStyles.withLeading)}>
      {leadingIcon && (
        <span className={fieldStyles.leadingIcon} aria-hidden="true">
          {leadingIcon}
        </span>
      )}
      {input}
      {adornment && <span className={fieldStyles.adornment}>{adornment}</span>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function Textarea({ invalid, className, ...rest }: TextareaProps) {
  return (
    <textarea
      className={cn(
        fieldStyles.control,
        fieldStyles.textarea,
        invalid && fieldStyles.invalid,
        className,
      )}
      {...rest}
    />
  );
}

type ClassValue = string | false | null | undefined;

/** Склеивает классы, отбрасывая пустые ветки условий. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ');
}

import { useEffect, useState } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface Result<T> {
  key: string;
  data: T | null;
  error: Error | null;
}

/**
 * Минимальная обёртка над промисом моков: данные, флаг загрузки, ошибка.
 *
 * Загрузку не выставляем через setState в эффекте, а выводим сравнением
 * ключа: пока в состоянии лежит результат от прошлого набора зависимостей,
 * значит новый ещё летит.
 *
 * Когда появится настоящий API, это место заменит нормальный клиент запросов.
 */
export function useAsync<T>(factory: () => Promise<T>, key: string): AsyncState<T> {
  const [result, setResult] = useState<Result<T> | null>(null);

  useEffect(() => {
    let cancelled = false;

    factory()
      .then((data) => {
        if (!cancelled) setResult({ key, data, error: null });
      })
      .catch((error: Error) => {
        if (!cancelled) setResult({ key, data: null, error });
      });

    return () => {
      cancelled = true;
    };
  }, [factory, key]);

  if (result?.key !== key) return { data: null, loading: true, error: null };
  return { data: result.data, loading: false, error: result.error };
}

/**
 * Заглушка сетевого слоя. Возвращает промисы с задержкой, чтобы скелетоны и
 * состояния загрузки были настоящими, а не декоративными.
 *
 * Когда появится FastAPI, эти функции заменяются на реальный клиент — экраны
 * при этом не меняются, потому что вызывают их через одинаковый интерфейс.
 */

const MIN_DELAY = 300;
const MAX_DELAY = 600;

function randomDelay(): number {
  return MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
}

export function mockRequest<T>(factory: () => T, delay = randomDelay()): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(factory()), delay);
  });
}

/** Долгая операция вроде первой синхронизации WakaTime. */
export function mockSlowRequest<T>(factory: () => T): Promise<T> {
  return mockRequest(factory, 1400 + Math.random() * 600);
}

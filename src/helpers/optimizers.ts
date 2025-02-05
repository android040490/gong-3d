export function throttle<T extends (...args: any[]) => void>(
  func: T,
  delay: number,
): T {
  let lastCall = 0;
  return function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func.apply(this, args);
    }
  } as T;
}

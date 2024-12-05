/**
 * debounce 함수는 연이어 호출되는 함수들 중 마지막 함수만 실행되도록 하는 함수입니다.
 * 즉, 호출을 지연시키고, 지연 시간 안에 동일한 함수가 호출되면 타이머를 초기화하여 마지막 호출만 실행합니다.
 *
 * @template T 함수의 타입
 * @param {T} fn - 실행할 함수
 * @param {number} delay - 지연 시간(ms)
 * @returns {(...args: Parameters<T>) => void} - 디바운스된 함수
 */
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const debounce = <T extends (...args: any[]) => void>(fn: T, delay: number) => {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>): void => {
    if (timeout) clearTimeout(timeout); // 이전 타이머가 존재하면 초기화
    timeout = setTimeout(() => {
      fn(...args); // 지정된 시간이 지난 후에 함수 실행
    }, delay);
  };
};

/**
 * throttle 함수는 특정 시간 간격 내에서는 함수가 한 번만 실행되도록 하는 함수입니다.
 * 즉, 주어진 시간 간격 동안 한 번 실행된 이후 추가적인 호출을 막아줍니다.
 *
 * @template T 함수의 타입
 * @param {T} fn - 실행할 함수
 * @param {number} limit - 제한 시간(ms)
 * @returns {(...args: Parameters<T>) => void} - 쓰로틀링된 함수
 */
// biome-ignore lint/suspicious/noExplicitAny:
const throttle = <T extends (...args: any[]) => void>(fn: T, limit: number) => {
  let lastRan = 0;
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const throttledFn = (...args: Parameters<T>): void => {
    const now = Date.now();
    if (now - lastRan >= limit) {
      fn(...args);
      lastRan = now;
    } else if (!timeout) {
      timeout = setTimeout(
        () => {
          fn(...args);
          lastRan = Date.now();
          timeout = null;
        },
        limit - (now - lastRan),
      );
    }
  };
  throttledFn.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  return throttledFn;
};

export { debounce, throttle };

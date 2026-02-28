import { useEffect, useState } from "react";

/**
 * Debounces a value by the given delay (ms).
 * Only updates the returned value after the user has stopped changing it for `delay` ms.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounced(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debounced;
}

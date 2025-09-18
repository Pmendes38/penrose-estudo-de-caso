'use client';
import { useEffect, useState } from 'react';

export function useDebouncedValue<T>(value: T, delayMs = 400) {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

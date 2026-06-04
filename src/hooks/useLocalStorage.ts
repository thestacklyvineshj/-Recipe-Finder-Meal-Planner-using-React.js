import { useState, useEffect } from 'react';
import { getStorageItem, setStorageItem } from '../utils/localStorage';

function readStoredValue<T>(key: string, initialValue: T): T {
  if (typeof window === 'undefined') return initialValue;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return initialValue;
    // Support legacy plain-string theme values (not JSON-wrapped)
    if (key === 'theme' && (raw === 'light' || raw === 'dark')) {
      return raw as T;
    }
    return getStorageItem<T>(key, initialValue);
  } catch {
    return initialValue;
  }
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    return readStoredValue(key, initialValue);
  });

  useEffect(() => {
    setStorageItem(key, storedValue);
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}

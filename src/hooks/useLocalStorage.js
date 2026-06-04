import { useState, useEffect } from 'react';
import { getStorageItem, setStorageItem } from '../utils/localStorage';

function readStoredValue(key, initialValue) {
  if (typeof window === 'undefined') return initialValue;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return initialValue;
    if (key === 'theme' && (raw === 'light' || raw === 'dark')) {
      return raw;
    }
    return getStorageItem(key, initialValue);
  } catch {
    return initialValue;
  }
}

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    return readStoredValue(key, initialValue);
  });

  useEffect(() => {
    setStorageItem(key, storedValue);
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

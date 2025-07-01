import { useCallback, useMemo, useRef, useEffect } from 'react';

// Debounce hook for search inputs and API calls
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay]
  ) as T;
}

// Throttle hook for scroll events and frequent updates
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef(0);
  const lastCallTimer = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall.current >= delay) {
        callback(...args);
        lastCall.current = now;
      } else {
        if (lastCallTimer.current) {
          clearTimeout(lastCallTimer.current);
        }
        lastCallTimer.current = setTimeout(() => {
          callback(...args);
          lastCall.current = Date.now();
        }, delay - (now - lastCall.current));
      }
    },
    [callback, delay]
  ) as T;
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [ref, setRef] = useState<Element | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(ref);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return [setRef, isIntersecting] as const;
}

// Virtual scrolling hook for large lists
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    );
    return { start: Math.max(0, start - overscan), end };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index,
      style: {
        position: 'absolute' as const,
        top: (visibleRange.start + index) * itemHeight,
        height: itemHeight,
        width: '100%',
      },
    }));
  }, [items, visibleRange, itemHeight]);

  const totalHeight = items.length * itemHeight;

  return {
    visibleItems,
    totalHeight,
    scrollTop,
    setScrollTop,
  };
}

// Memoization utilities
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// Local storage with expiration
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  expirationMinutes: number = 60
) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;

      const parsed = JSON.parse(item);
      if (parsed.expiry && Date.now() > parsed.expiry) {
        window.localStorage.removeItem(key);
        return initialValue;
      }

      return parsed.value;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      const item = {
        value: valueToStore,
        expiry: Date.now() + expirationMinutes * 60 * 1000,
      };
      
      window.localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue, expirationMinutes]);

  return [storedValue, setValue] as const;
}

// Session storage hook
export function useSessionStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting sessionStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}

// Image preloading utility
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

// Batch updates utility
export function useBatchUpdates<T>(
  items: T[],
  batchSize: number = 10,
  delay: number = 16
) {
  const [displayedItems, setDisplayedItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setIsLoading(true);
    setDisplayedItems([]);

    let currentIndex = 0;

    const processBatch = () => {
      const batch = items.slice(currentIndex, currentIndex + batchSize);
      setDisplayedItems(prev => [...prev, ...batch]);
      currentIndex += batchSize;

      if (currentIndex < items.length) {
        timeoutRef.current = setTimeout(processBatch, delay);
      } else {
        setIsLoading(false);
      }
    };

    if (items.length > 0) {
      processBatch();
    } else {
      setIsLoading(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [items, batchSize, delay]);

  return { displayedItems, isLoading };
}

// Performance monitoring
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} rendered ${renderCount.current} times in ${duration.toFixed(2)}ms`);
    }
    
    startTime.current = endTime;
  });

  return renderCount.current;
}

// Error boundary hook
export function useErrorBoundary() {
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback((error: Error) => {
    setError(error);
    console.error('Error caught by boundary:', error);
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, resetError };
}

// Network status hook
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// Import missing useState
import { useState } from 'react'; 
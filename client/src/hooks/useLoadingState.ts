import { useState, useEffect, useCallback, useRef } from 'react';

interface LoadingState {
  isLoading: boolean;
  loadingMessage: string;
  progress?: number;
  error?: string;
}

interface UseLoadingStateOptions {
  minLoadingTime?: number;
  loadingMessage?: string;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export function useLoadingState(options: UseLoadingStateOptions = {}) {
  const {
    minLoadingTime = 300,
    loadingMessage = "Loading...",
    onComplete,
    onError
  } = options;

  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    loadingMessage,
    progress: undefined,
    error: undefined
  });

  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const startLoading = useCallback((message?: string) => {
    startTimeRef.current = Date.now();
    setState(prev => ({
      ...prev,
      isLoading: true,
      loadingMessage: message || loadingMessage,
      error: undefined,
      progress: undefined
    }));
  }, [loadingMessage]);

  const stopLoading = useCallback(() => {
    const elapsed = Date.now() - startTimeRef.current;
    const remaining = Math.max(0, minLoadingTime - elapsed);

    if (remaining > 0) {
      timeoutRef.current = setTimeout(() => {
        setState(prev => ({
          ...prev,
          isLoading: false,
          progress: undefined
        }));
        onComplete?.();
      }, remaining);
    } else {
      setState(prev => ({
        ...prev,
        isLoading: false,
        progress: undefined
      }));
      onComplete?.();
    }
  }, [minLoadingTime, onComplete]);

  const setError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      error,
      isLoading: false,
      progress: undefined
    }));
    onError?.(error);
  }, [onError]);

  const setProgress = useCallback((progress: number) => {
    setState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress))
    }));
  }, []);

  const updateMessage = useCallback((message: string) => {
    setState(prev => ({
      ...prev,
      loadingMessage: message
    }));
  }, []);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setState({
      isLoading: false,
      loadingMessage,
      progress: undefined,
      error: undefined
    });
  }, [loadingMessage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    startLoading,
    stopLoading,
    setError,
    setProgress,
    updateMessage,
    reset
  };
}

// Hook for managing multiple loading states
export function useLoadingQueue() {
  const [queue, setQueue] = useState<string[]>([]);
  const [currentLoading, setCurrentLoading] = useState<string | null>(null);

  const addToQueue = useCallback((id: string) => {
    setQueue(prev => [...prev, id]);
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    setQueue(prev => prev.filter(item => item !== id));
    if (currentLoading === id) {
      setCurrentLoading(null);
    }
  }, [currentLoading]);

  const startNext = useCallback(() => {
    if (queue.length > 0 && !currentLoading) {
      const next = queue[0];
      setCurrentLoading(next);
    }
  }, [queue, currentLoading]);

  const isLoading = queue.length > 0 || currentLoading !== null;

  return {
    queue,
    currentLoading,
    isLoading,
    addToQueue,
    removeFromQueue,
    startNext
  };
}

// Hook for async operations with loading state
export function useAsyncLoading<T extends any[], R>(
  asyncFn: (...args: T) => Promise<R>,
  options: UseLoadingStateOptions = {}
) {
  const loadingState = useLoadingState(options);

  const execute = useCallback(async (...args: T): Promise<R | undefined> => {
    try {
      loadingState.startLoading();
      const result = await asyncFn(...args);
      loadingState.stopLoading();
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      loadingState.setError(errorMessage);
      throw error;
    }
  }, [asyncFn, loadingState]);

  return {
    ...loadingState,
    execute
  };
} 
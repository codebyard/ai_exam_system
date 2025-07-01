import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PageLoader } from '@/components/ui/loading';

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  setLoading: (loading: boolean, message?: string) => void;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');

  const setLoading = (loading: boolean, message: string = 'Loading...') => {
    setIsLoading(loading);
    setLoadingMessage(message);
  };

  const showLoading = (message: string = 'Loading...') => {
    setLoading(true, message);
  };

  const hideLoading = () => {
    setLoading(false);
  };

  return (
    <LoadingContext.Provider value={{
      isLoading,
      loadingMessage,
      setLoading,
      showLoading,
      hideLoading,
    }}>
      {children}
      {isLoading && <PageLoader message={loadingMessage} />}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
} 
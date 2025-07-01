import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Spinner, ContentLoader } from '@/components/ui/loading';

interface LoadingWrapperProps {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingMessage?: string;
  fallback?: React.ReactNode;
  minLoadingTime?: number; // Minimum time to show loading (prevents flash)
  className?: string;
  showSpinner?: boolean;
  skeleton?: boolean;
}

export default function LoadingWrapper({
  children,
  isLoading = false,
  loadingMessage = "Loading...",
  fallback,
  minLoadingTime = 300,
  className,
  showSpinner = true,
  skeleton = false
}: LoadingWrapperProps) {
  const [shouldShowLoading, setShouldShowLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setShouldShowLoading(true);
      setHasLoaded(false);
    } else {
      // Add a small delay to prevent flash of content
      const timer = setTimeout(() => {
        setShouldShowLoading(false);
        setHasLoaded(true);
      }, minLoadingTime);
      return () => clearTimeout(timer);
    }
  }, [isLoading, minLoadingTime]);

  if (shouldShowLoading) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (skeleton) {
      return (
        <div className={cn("w-full", className)}>
          <ContentLoader />
        </div>
      );
    }

    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="text-center space-y-4">
          {showSpinner && <Spinner size="lg" />}
          {loadingMessage && (
            <p className="text-muted-foreground">{loadingMessage}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "transition-opacity duration-200",
      hasLoaded ? "opacity-100" : "opacity-0",
      className
    )}>
      {children}
    </div>
  );
}

// Specialized loading wrappers for common use cases
export function CardLoadingWrapper({ children, isLoading, ...props }: LoadingWrapperProps) {
  return (
    <LoadingWrapper
      isLoading={isLoading}
      skeleton={true}
      className="bg-card rounded-lg border p-6"
      {...props}
    >
      {children}
    </LoadingWrapper>
  );
}

export function PageLoadingWrapper({ children, isLoading, ...props }: LoadingWrapperProps) {
  return (
    <LoadingWrapper
      isLoading={isLoading}
      className="min-h-screen bg-background"
      {...props}
    >
      {children}
    </LoadingWrapper>
  );
}

export function ButtonLoadingWrapper({ 
  children, 
  isLoading, 
  loadingText = "Loading...",
  ...props 
}: LoadingWrapperProps & { loadingText?: string }) {
  return (
    <LoadingWrapper
      isLoading={isLoading}
      loadingMessage={loadingText}
      showSpinner={true}
      minLoadingTime={0}
      {...props}
    >
      {children}
    </LoadingWrapper>
  );
} 
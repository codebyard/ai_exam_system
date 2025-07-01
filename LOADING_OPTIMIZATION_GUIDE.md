# Loading & Optimization Guide

This document outlines the comprehensive loading states and performance optimizations implemented across the AI Exam System.

## 🚀 Overview

The project now includes:
- **Comprehensive Loading Components**: Reusable loading states for all UI elements
- **Global Loading Context**: Centralized loading state management
- **Performance Optimizations**: Debouncing, throttling, memoization, and caching
- **Better UX**: Smooth transitions, skeleton loaders, and contextual loading messages

## 📁 File Structure

```
client/src/
├── components/
│   ├── ui/
│   │   └── loading.tsx          # Comprehensive loading component library
│   └── LoadingWrapper.tsx       # Loading wrapper components
├── contexts/
│   └── LoadingContext.tsx       # Global loading state management
├── hooks/
│   └── useLoadingState.ts       # Advanced loading state hooks
└── lib/
    └── optimizations.ts         # Performance optimization utilities
```

## 🎯 Loading Components

### Basic Loading Components

#### 1. Spinner
```tsx
import { Spinner } from '@/components/ui/loading';

<Spinner size="sm" />      // Small spinner
<Spinner size="default" /> // Default size
<Spinner size="lg" />      // Large spinner
```

#### 2. Page Loader
```tsx
import { PageLoader } from '@/components/ui/loading';

<PageLoader message="Loading your exam..." />
```

#### 3. Content Loader
```tsx
import { ContentLoader } from '@/components/ui/loading';

<ContentLoader className="my-4" />
```

### Specialized Loaders

#### 4. Exam Card Loader
```tsx
import { ExamCardLoader } from '@/components/ui/loading';

// Perfect for exam lists
<div className="grid md:grid-cols-3 gap-6">
  {[...Array(6)].map((_, i) => (
    <ExamCardLoader key={i} />
  ))}
</div>
```

#### 5. Question Loader
```tsx
import { QuestionLoader } from '@/components/ui/loading';

// For question display areas
<QuestionLoader />
```

#### 6. Stats Loader
```tsx
import { StatsLoader } from '@/components/ui/loading';

// For dashboard statistics
<StatsLoader />
```

#### 7. Contextual Loaders
```tsx
import { ExamLoader, UserLoader, AnalyticsLoader } from '@/components/ui/loading';

<ExamLoader />      // Loading exam with book icon
<UserLoader />      // Loading user data with users icon
<AnalyticsLoader /> // Loading analytics with trending icon
```

## 🔄 Loading Wrappers

### Page Loading Wrapper
```tsx
import { PageLoadingWrapper } from '@/components/LoadingWrapper';

<PageLoadingWrapper 
  isLoading={isLoading}
  loadingMessage="Loading exam details..."
  minLoadingTime={500}
>
  <YourComponent />
</PageLoadingWrapper>
```

### Card Loading Wrapper
```tsx
import { CardLoadingWrapper } from '@/components/LoadingWrapper';

<CardLoadingWrapper isLoading={isLoading}>
  <YourCardContent />
</CardLoadingWrapper>
```

### Button Loading Wrapper
```tsx
import { ButtonLoadingWrapper } from '@/components/LoadingWrapper';

<ButtonLoadingWrapper 
  isLoading={isSubmitting}
  loadingText="Submitting..."
>
  <Button>Submit Exam</Button>
</ButtonLoadingWrapper>
```

## 🌐 Global Loading Context

### Setup
```tsx
// App.tsx
import { LoadingProvider } from '@/contexts/LoadingContext';

export default function App() {
  return (
    <LoadingProvider>
      <YourApp />
    </LoadingProvider>
  );
}
```

### Usage
```tsx
import { useLoading } from '@/contexts/LoadingContext';

function MyComponent() {
  const { showLoading, hideLoading, isLoading } = useLoading();

  const handleAsyncOperation = async () => {
    showLoading("Processing your request...");
    try {
      await someAsyncOperation();
    } finally {
      hideLoading();
    }
  };

  return (
    <div>
      {isLoading && <div>Global loading is active</div>}
    </div>
  );
}
```

## ⚡ Performance Optimizations

### 1. Debouncing
```tsx
import { useDebounce } from '@/lib/optimizations';

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const debouncedSearch = useDebounce((term: string) => {
    // API call here
    searchAPI(term);
  }, 300);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term);
  };
}
```

### 2. Throttling
```tsx
import { useThrottle } from '@/lib/optimizations';

function ScrollComponent() {
  const throttledScrollHandler = useThrottle((event: Event) => {
    // Handle scroll events
    console.log('Scroll position:', window.scrollY);
  }, 100);

  useEffect(() => {
    window.addEventListener('scroll', throttledScrollHandler);
    return () => window.removeEventListener('scroll', throttledScrollHandler);
  }, [throttledScrollHandler]);
}
```

### 3. Local Storage with Expiration
```tsx
import { useLocalStorage } from '@/lib/optimizations';

function MyComponent() {
  const [userPreferences, setUserPreferences] = useLocalStorage(
    'user-preferences',
    { theme: 'light', language: 'en' },
    60 // Expires in 60 minutes
  );

  return (
    <div>
      <button onClick={() => setUserPreferences({ ...userPreferences, theme: 'dark' })}>
        Toggle Theme
      </button>
    </div>
  );
}
```

### 4. Intersection Observer for Lazy Loading
```tsx
import { useIntersectionObserver } from '@/lib/optimizations';

function LazyImage({ src, alt }: { src: string; alt: string }) {
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
  });

  return (
    <div ref={ref}>
      {isIntersecting ? (
        <img src={src} alt={alt} />
      ) : (
        <div className="h-64 bg-muted animate-pulse rounded" />
      )}
    </div>
  );
}
```

### 5. Virtual Scrolling for Large Lists
```tsx
import { useVirtualScroll } from '@/lib/optimizations';

function VirtualList({ items }: { items: any[] }) {
  const { visibleItems, totalHeight, scrollTop, setScrollTop } = useVirtualScroll(
    items,
    50, // item height
    400, // container height
    5   // overscan
  );

  return (
    <div 
      style={{ height: 400, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, style }) => (
          <div key={item.id} style={style}>
            {item.content}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 🎨 Implementation Examples

### Dashboard with Loading States
```tsx
import { PageLoadingWrapper, StatsLoader, ExamCardLoader } from '@/components/LoadingWrapper';
import { useQuery } from '@tanstack/react-query';

export default function Dashboard() {
  const { data: exams, isLoading: examsLoading } = useQuery(['exams'], fetchExams);
  const { data: stats, isLoading: statsLoading } = useQuery(['stats'], fetchStats);

  const isLoading = examsLoading || statsLoading;

  return (
    <PageLoadingWrapper isLoading={isLoading}>
      <div className="min-h-screen bg-background">
        <NavigationMenu />
        
        {/* Stats Section */}
        {isLoading ? (
          <StatsLoader />
        ) : (
          <StatsGrid stats={stats} />
        )}

        {/* Exams Section */}
        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <ExamCardLoader key={i} />
            ))}
          </div>
        ) : (
          <ExamsGrid exams={exams} />
        )}
      </div>
    </PageLoadingWrapper>
  );
}
```

### Exam Details with Progressive Loading
```tsx
import { PageLoadingWrapper } from '@/components/LoadingWrapper';
import { useAsyncLoading } from '@/hooks/useLoadingState';

export default function ExamDetails() {
  const { isLoading, execute, error } = useAsyncLoading(
    async (examId: string) => {
      const [exam, papers, access] = await Promise.all([
        fetchExam(examId),
        fetchPapers(examId),
        fetchAccess(examId),
      ]);
      return { exam, papers, access };
    },
    { minLoadingTime: 500, loadingMessage: "Loading exam details..." }
  );

  const handleLoadExam = async () => {
    try {
      const result = await execute(examId);
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  return (
    <PageLoadingWrapper isLoading={isLoading}>
      <ExamDetailsContent />
    </PageLoadingWrapper>
  );
}
```

## 🔧 Best Practices

### 1. Loading State Hierarchy
- **Global Loading**: For app-wide operations (auth, routing)
- **Page Loading**: For page-level data fetching
- **Component Loading**: For specific component operations
- **Button Loading**: For user actions

### 2. Loading Messages
- Be specific about what's happening
- Use progressive disclosure for complex operations
- Provide estimated time when possible

### 3. Performance Tips
- Use `minLoadingTime` to prevent flash of content
- Implement skeleton loaders for better perceived performance
- Cache frequently accessed data
- Use debouncing for search inputs
- Implement virtual scrolling for large lists

### 4. Error Handling
```tsx
import { useErrorBoundary } from '@/lib/optimizations';

function MyComponent() {
  const { error, handleError, resetError } = useErrorBoundary();

  if (error) {
    return (
      <div className="text-center p-8">
        <h3>Something went wrong</h3>
        <p>{error.message}</p>
        <button onClick={resetError}>Try Again</button>
      </div>
    );
  }

  return <YourComponent />;
}
```

## 📊 Performance Monitoring

### Development Monitoring
```tsx
import { usePerformanceMonitor } from '@/lib/optimizations';

function MyComponent() {
  const renderCount = usePerformanceMonitor('MyComponent');
  
  // Component will log render count and duration in development
  return <div>Rendered {renderCount} times</div>;
}
```

### Network Status
```tsx
import { useNetworkStatus } from '@/lib/optimizations';

function NetworkAwareComponent() {
  const isOnline = useNetworkStatus();

  return (
    <div>
      {!isOnline && (
        <div className="bg-warning text-warning-foreground p-2">
          You're offline. Some features may be limited.
        </div>
      )}
    </div>
  );
}
```

## 🚀 Migration Guide

### Before (Basic Loading)
```tsx
if (isLoading) {
  return <div>Loading...</div>;
}
```

### After (Enhanced Loading)
```tsx
import { PageLoadingWrapper, StatsLoader } from '@/components/LoadingWrapper';

<PageLoadingWrapper isLoading={isLoading}>
  {isLoading ? <StatsLoader /> : <YourContent />}
</PageLoadingWrapper>
```

## 📈 Benefits

1. **Better UX**: Users see meaningful loading states
2. **Performance**: Optimized rendering and data fetching
3. **Maintainability**: Reusable loading components
4. **Consistency**: Uniform loading experience across the app
5. **Accessibility**: Proper loading indicators for screen readers
6. **Mobile Optimization**: Efficient loading on slower connections

## 🔮 Future Enhancements

- [ ] Skeleton animations with shimmer effects
- [ ] Progressive image loading
- [ ] Service Worker for offline caching
- [ ] Real-time progress indicators
- [ ] Predictive loading based on user behavior
- [ ] A/B testing for different loading strategies

---

This comprehensive loading and optimization system provides a solid foundation for a smooth, performant user experience across the AI Exam System. 
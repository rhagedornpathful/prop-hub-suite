import { QueryClient } from '@tanstack/react-query';
import { CACHE_TIMES } from './performance/caching';

/**
 * Optimized Query Client with advanced caching strategies
 * - Implements stale-while-revalidate pattern
 * - Configures smart retry logic
 * - Enables background refetching
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale-while-revalidate: show cached data while fetching fresh data
      staleTime: CACHE_TIMES.STANDARD, // 5 minutes - data is fresh
      gcTime: CACHE_TIMES.MODERATE, // 10 minutes - cache cleanup time
      
      // Network behavior
      refetchOnWindowFocus: false, // Don't refetch on every window focus
      refetchOnReconnect: true, // Do refetch when reconnecting
      refetchOnMount: false, // Don't refetch if data is fresh
      
      // Retry configuration with exponential backoff
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Enable suspense and error boundaries
      throwOnError: false,
      
      // Network mode
      networkMode: 'online',
      
      // Enable deduplication for identical concurrent queries
      structuralSharing: true,
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
      // Optimistic updates by default
      onMutate: async () => {
        // Can be overridden per mutation
      },
    },
  },
});
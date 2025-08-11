import { useQuery, useQueries, UseQueryOptions } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

interface OptimizedQueryConfig<T> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  staleTime?: number;
  gcTime?: number;
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  retry?: number;
  select?: (data: T) => any;
}

// Optimized hook for multiple related queries
export function useOptimizedQueries<T extends Record<string, any>>(
  queries: OptimizedQueryConfig<any>[],
  options?: {
    combine?: boolean;
    suspense?: boolean;
  }
) {
  const optimizedQueries = useMemo(() => 
    queries.map(query => ({
      ...query,
      staleTime: query.staleTime ?? 5 * 60 * 1000, // 5 minutes
      gcTime: query.gcTime ?? 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: query.refetchOnWindowFocus ?? false,
      refetchOnReconnect: query.refetchOnReconnect ?? true,
      retry: query.retry ?? 2,
    })), 
    [queries]
  );

  const results = useQueries({
    queries: optimizedQueries,
    combine: options?.combine ? (results) => ({
      data: results.reduce((acc, result, index) => {
        const key = queries[index].queryKey[0];
        (acc as any)[key] = result.data;
        return acc;
      }, {} as T),
      isLoading: results.some(result => result.isLoading),
      isError: results.some(result => result.isError),
      errors: results.map(result => result.error).filter(Boolean),
    }) : undefined,
  });

  return options?.combine ? results : results;
}

// Pagination hook for large datasets
export function usePaginatedQuery<T>(
  baseQueryKey: string[],
  queryFn: (page: number, limit: number) => Promise<{ data: T[]; total: number; hasMore: boolean }>,
  options?: {
    limit?: number;
    enabled?: boolean;
    keepPreviousData?: boolean;
  }
) {
  const limit = options?.limit ?? 20;
  
  const query = useQuery({
    queryKey: [...baseQueryKey, 'paginated', { limit }],
    queryFn: () => queryFn(1, limit),
    enabled: options?.enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes for paginated data
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: options?.keepPreviousData ? (prev) => prev : undefined,
  });

  const loadMore = useCallback(async (page: number) => {
    // Implementation would depend on your specific needs
    // This is a placeholder for infinite loading functionality
  }, []);

  return {
    ...query,
    loadMore,
    hasMore: query.data?.hasMore ?? false,
    total: query.data?.total ?? 0,
  };
}

// Performance monitoring for queries
export function useQueryPerformance() {
  const startTime = useMemo(() => performance.now(), []);

  const measureQuery = useCallback((queryKey: string[], duration?: number) => {
    const endTime = performance.now();
    const queryDuration = duration ?? (endTime - startTime);
    
    // Log slow queries (> 1 second)
    if (queryDuration > 1000) {
      console.warn(`Slow query detected: ${queryKey.join('.')} took ${queryDuration.toFixed(2)}ms`);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      // Analytics implementation would go here
    }
  }, [startTime]);

  return { measureQuery };
}
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';

interface OptimizedQueryOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  retry?: number;
  retryDelay?: number;
  prefetch?: boolean;
  background?: boolean;
}

export function useOptimizedQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options: OptimizedQueryOptions = {}
) {
  const queryClient = useQueryClient();

  const optimizedOptions = {
    staleTime: 5 * 60 * 1000, // 5 minutes default
    gcTime: 10 * 60 * 1000, // 10 minutes default
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  };

  const query = useQuery({
    queryKey,
    queryFn,
    ...optimizedOptions,
  });

  // Prefetch related data
  const prefetchRelated = useCallback(
    (relatedKeys: string[], relatedFn: () => Promise<any>) => {
      if (options.prefetch && query.data) {
        queryClient.prefetchQuery({
          queryKey: relatedKeys,
          queryFn: relatedFn,
          staleTime: optimizedOptions.staleTime,
        });
      }
    },
    [queryClient, query.data, options.prefetch, optimizedOptions.staleTime]
  );

  // Background refresh
  useEffect(() => {
    if (options.background && query.data) {
      const interval = setInterval(() => {
        queryClient.refetchQueries({ queryKey });
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [queryClient, queryKey, query.data, options.background]);

  // Invalidate stale data
  const invalidateCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  // Update cache with new data
  const updateCache = useCallback((updater: (oldData: T | undefined) => T) => {
    queryClient.setQueryData(queryKey, updater);
  }, [queryClient, queryKey]);

  return {
    ...query,
    prefetchRelated,
    invalidateCache,
    updateCache,
  };
}

// Hook for optimizing mutations
export function useOptimisticUpdate<T>(queryKey: string[]) {
  const queryClient = useQueryClient();

  const optimisticUpdate = useCallback(
    (updater: (oldData: T | undefined) => T) => {
      // Cancel outgoing refetches
      queryClient.cancelQueries({ queryKey });
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData<T>(queryKey);
      
      // Optimistically update
      queryClient.setQueryData(queryKey, updater);
      
      return { previousData };
    },
    [queryClient, queryKey]
  );

  const rollback = useCallback(
    (previousData: T) => {
      queryClient.setQueryData(queryKey, previousData);
    },
    [queryClient, queryKey]
  );

  return { optimisticUpdate, rollback };
}
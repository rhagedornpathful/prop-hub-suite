/**
 * Advanced caching strategies for React Query
 * Implements stale-while-revalidate, prefetching, and cache warming
 */

import { QueryClient } from '@tanstack/react-query';

export const CACHE_TIMES = {
  // Fast-changing data (1-2 minutes)
  REALTIME: 1 * 60 * 1000,
  
  // Moderate data (5-10 minutes)
  STANDARD: 5 * 60 * 1000,
  MODERATE: 10 * 60 * 1000,
  
  // Slow-changing data (30-60 minutes)
  STABLE: 30 * 60 * 1000,
  LONG: 60 * 60 * 1000,
  
  // Static data (24 hours)
  STATIC: 24 * 60 * 60 * 1000,
} as const;

export const CACHE_KEYS = {
  PROPERTIES: 'properties',
  PROPERTY: 'property',
  TENANTS: 'tenants',
  TENANT: 'tenant',
  MAINTENANCE: 'maintenance_requests',
  OWNERS: 'property_owners',
  VENDORS: 'vendors',
  SERVICES: 'services',
  AUDIT_LOGS: 'audit-logs',
  USER_PROFILE: 'user-profile',
  METRICS: 'metrics',
} as const;

/**
 * Prefetch related data for smoother navigation
 */
export const prefetchRelatedData = async (
  queryClient: QueryClient,
  entityType: keyof typeof CACHE_KEYS,
  entityId: string
) => {
  switch (entityType) {
    case 'PROPERTY':
      // Prefetch tenants, maintenance, and check sessions
      await Promise.all([
        queryClient.prefetchQuery({
          queryKey: ['tenants', 'by-property', entityId],
          staleTime: CACHE_TIMES.STANDARD,
        }),
        queryClient.prefetchQuery({
          queryKey: ['maintenance_requests', 'by-property', entityId],
          staleTime: CACHE_TIMES.STANDARD,
        }),
      ]);
      break;
    
    case 'TENANT':
      // Prefetch tenant's property and maintenance requests
      await queryClient.prefetchQuery({
        queryKey: ['properties', 'by-tenant', entityId],
        staleTime: CACHE_TIMES.STANDARD,
      });
      break;
  }
};

/**
 * Invalidate related caches when data changes
 */
export const invalidateRelatedQueries = (
  queryClient: QueryClient,
  entityType: keyof typeof CACHE_KEYS,
  entityId?: string
) => {
  switch (entityType) {
    case 'PROPERTIES':
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      break;
    
    case 'TENANTS':
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] }); // Properties show tenant count
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      break;
    
    case 'MAINTENANCE':
      queryClient.invalidateQueries({ queryKey: ['maintenance_requests'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] }); // Properties show maintenance counts
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      break;
  }
};

/**
 * Optimistic update helper
 */
export const performOptimisticUpdate = async <T>(
  queryClient: QueryClient,
  queryKey: any[],
  updateFn: (old: T) => T
) => {
  await queryClient.cancelQueries({ queryKey });
  const previousData = queryClient.getQueryData<T>(queryKey);
  
  if (previousData) {
    queryClient.setQueryData(queryKey, updateFn(previousData));
  }
  
  return { previousData };
};

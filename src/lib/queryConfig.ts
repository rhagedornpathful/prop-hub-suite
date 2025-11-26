/**
 * React Query Configuration for Performance Optimization
 * Centralized caching strategy and query defaults
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Stale time configurations for different data types
 * - Static data (rarely changes): 5 minutes
 * - Semi-static (changes occasionally): 2 minutes
 * - Dynamic (frequently updated): 30 seconds
 * - Real-time (needs fresh data): 0 seconds
 */
export const STALE_TIMES = {
  STATIC: 5 * 60 * 1000,      // 5 minutes - property details, user profiles
  SEMI_STATIC: 2 * 60 * 1000, // 2 minutes - property lists, tenant lists
  DYNAMIC: 30 * 1000,         // 30 seconds - maintenance requests, messages
  REAL_TIME: 0,               // 0 seconds - live notifications, chat
} as const;

/**
 * Cache time configurations
 * How long inactive queries stay in cache before garbage collection
 */
export const CACHE_TIMES = {
  SHORT: 2 * 60 * 1000,       // 2 minutes
  MEDIUM: 5 * 60 * 1000,      // 5 minutes
  LONG: 10 * 60 * 1000,       // 10 minutes
} as const;

/**
 * Optimized Query Client with production-ready defaults
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default stale time - data considered fresh for 2 minutes
      staleTime: 2 * 60 * 1000,
      
      // Cache time - keep inactive queries for 10 minutes
      gcTime: CACHE_TIMES.LONG,
      
      // Retry failed queries with exponential backoff
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry only once for other errors
        return failureCount < 1;
      },
      
      // Exponential backoff: 1s, 2s
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      
      // Don't refetch on window focus for better performance
      refetchOnWindowFocus: false,
      
      // Refetch on reconnect
      refetchOnReconnect: true,
      
      // Don't refetch on mount if data is fresh
      refetchOnMount: false,
      
      // Keep previous data while fetching new data
      placeholderData: (previousData: unknown) => previousData,
    },
    mutations: {
      // Don't retry mutations by default
      retry: 0,
    },
  },
});

/**
 * Query key factory for consistent cache keys
 */
export const queryKeys = {
  // Properties
  properties: {
    all: ['properties'] as const,
    lists: () => [...queryKeys.properties.all, 'list'] as const,
    list: (filters?: Record<string, any>) => 
      [...queryKeys.properties.lists(), { filters }] as const,
    details: () => [...queryKeys.properties.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.properties.details(), id] as const,
  },
  
  // Maintenance Requests
  maintenance: {
    all: ['maintenance'] as const,
    lists: () => [...queryKeys.maintenance.all, 'list'] as const,
    list: (filters?: Record<string, any>) => 
      [...queryKeys.maintenance.lists(), { filters }] as const,
    details: () => [...queryKeys.maintenance.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.maintenance.details(), id] as const,
  },
  
  // Tenants
  tenants: {
    all: ['tenants'] as const,
    lists: () => [...queryKeys.tenants.all, 'list'] as const,
    list: (filters?: Record<string, any>) => 
      [...queryKeys.tenants.lists(), { filters }] as const,
    details: () => [...queryKeys.tenants.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.tenants.details(), id] as const,
  },
  
  // Messages
  messages: {
    all: ['messages'] as const,
    conversations: () => [...queryKeys.messages.all, 'conversation'] as const,
    conversation: (id: string) => [...queryKeys.messages.conversations(), id] as const,
  },
  
  // Documents
  documents: {
    all: ['documents'] as const,
    lists: () => [...queryKeys.documents.all, 'list'] as const,
    list: (filters?: Record<string, any>) => 
      [...queryKeys.documents.lists(), { filters }] as const,
  },
  
  // Payments
  payments: {
    all: ['payments'] as const,
    lists: () => [...queryKeys.payments.all, 'list'] as const,
    list: (filters?: Record<string, any>) => 
      [...queryKeys.payments.lists(), { filters }] as const,
  },
  
  // Home Check Sessions
  homeCheckSessions: {
    all: ['homeCheckSessions'] as const,
    lists: () => [...queryKeys.homeCheckSessions.all, 'list'] as const,
    list: (filters?: Record<string, any>) => 
      [...queryKeys.homeCheckSessions.lists(), { filters }] as const,
  },
  
  // Audit Logs
  auditLogs: {
    all: ['auditLogs'] as const,
    lists: () => [...queryKeys.auditLogs.all, 'list'] as const,
    list: (filters?: Record<string, any>) => 
      [...queryKeys.auditLogs.lists(), { filters }] as const,
  },
} as const;

/**
 * Helper to invalidate related queries after mutations
 */
export const invalidateQueries = {
  property: (propertyId?: string) => {
    if (propertyId) {
      return [
        queryKeys.properties.detail(propertyId),
        queryKeys.properties.lists(),
        queryKeys.maintenance.lists(),
        queryKeys.tenants.lists(),
      ];
    }
    return [queryKeys.properties.lists()];
  },
  
  maintenance: (maintenanceId?: string) => {
    if (maintenanceId) {
      return [
        queryKeys.maintenance.detail(maintenanceId),
        queryKeys.maintenance.lists(),
      ];
    }
    return [queryKeys.maintenance.lists()];
  },
  
  tenant: (tenantId?: string) => {
    if (tenantId) {
      return [
        queryKeys.tenants.detail(tenantId),
        queryKeys.tenants.lists(),
      ];
    }
    return [queryKeys.tenants.lists()];
  },
};

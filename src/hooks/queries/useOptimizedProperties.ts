/**
 * Optimized properties query with advanced caching and pagination
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CACHE_TIMES, CACHE_KEYS, prefetchRelatedData } from '@/lib/performance/caching';
import type { PropertyWithRelations } from './useProperties';

interface UseOptimizedPropertiesOptions {
  page?: number;
  pageSize?: number;
  sortBy?: 'created_at' | 'address' | 'monthly_rent';
  sortOrder?: 'asc' | 'desc';
  enabled?: boolean;
}

export const useOptimizedProperties = ({
  page = 1,
  pageSize = 20,
  sortBy = 'created_at',
  sortOrder = 'desc',
  enabled = true,
}: UseOptimizedPropertiesOptions = {}) => {
  const { user, activeRole, actualRole } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [CACHE_KEYS.PROPERTIES, user?.id, activeRole, page, pageSize, sortBy, sortOrder],
    queryFn: async (): Promise<{ properties: PropertyWithRelations[]; total: number }> => {
      if (!user) return { properties: [], total: 0 };

      const effectiveRole = activeRole || actualRole;

      // Build base query
      let countQuery = supabase.from('properties').select('*', { count: 'exact', head: true });
      let dataQuery = supabase
        .from('properties')
        .select(`
          *,
          property_owner:property_owners(*),
          property_owner_associations(
            *,
            property_owner:property_owners(*)
          ),
          tenants(*),
          maintenance_requests(*)
        `);

      // Filter by role - property owners only see their properties
      if (effectiveRole === 'owner_investor') {
        // Get properties where user is associated as owner
        const { data: ownerData } = await supabase
          .from('property_owners')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (ownerData) {
          const { data: associations } = await supabase
            .from('property_owner_associations')
            .select('property_id')
            .eq('property_owner_id', ownerData.id);

          const propertyIds = associations?.map(a => a.property_id) || [];
          
          if (propertyIds.length === 0) {
            return { properties: [], total: 0 };
          }

          countQuery = countQuery.in('id', propertyIds);
          dataQuery = dataQuery.in('id', propertyIds);
        } else {
          return { properties: [], total: 0 };
        }
      }

      // Get total count
      const { count } = await countQuery;
      const total = count || 0;

      // Fetch properties with pagination
      const { data: properties, error } = await dataQuery
        .range((page - 1) * pageSize, page * pageSize - 1)
        .order(sortBy, { ascending: sortOrder === 'asc' });

      if (error) throw error;

      // Fetch check sessions
      const propertyIds = (properties || []).map(p => p.id);
      const { data: checkSessions = [] } = propertyIds.length > 0
        ? await supabase
            .from('property_check_sessions')
            .select('*')
            .in('property_id', propertyIds)
        : { data: [] };

      // Calculate metrics
      const propertiesWithMetrics = (properties || []).map(property => {
        const propertySessions = checkSessions.filter(
          session => session.property_id === property.id
        );

        const completedSessions = propertySessions.filter(
          session => session.completed_at
        );
        const lastCompletedSession = completedSessions.length > 0
          ? completedSessions.sort(
              (a, b) =>
                new Date(b.completed_at!).getTime() -
                new Date(a.completed_at!).getTime()
            )[0]
          : null;

        const scheduledSessions = propertySessions.filter(
          session =>
            session.scheduled_date &&
            new Date(session.scheduled_date) >= new Date() &&
            !session.completed_at
        );
        const nextScheduledSession = scheduledSessions.length > 0
          ? scheduledSessions.sort(
              (a, b) =>
                new Date(a.scheduled_date!).getTime() -
                new Date(b.scheduled_date!).getTime()
            )[0]
          : null;

        return {
          ...property,
          property_check_sessions: propertySessions,
          maintenance_count: property.maintenance_requests?.length || 0,
          pending_maintenance:
            property.maintenance_requests?.filter(req => req.status === 'pending')
              .length || 0,
          urgent_maintenance:
            property.maintenance_requests?.filter(req => req.priority === 'urgent')
              .length || 0,
          last_check_date: lastCompletedSession?.completed_at || null,
          next_check_date: nextScheduledSession?.scheduled_date || null,
        };
      });

      // Prefetch next page
      if (properties && properties.length === pageSize) {
        queryClient.prefetchQuery({
          queryKey: [
            CACHE_KEYS.PROPERTIES,
            user.id,
            page + 1,
            pageSize,
            sortBy,
            sortOrder,
          ],
          queryFn: async () => {
            const { data } = await supabase
              .from('properties')
              .select('*')
              .range(page * pageSize, (page + 1) * pageSize - 1)
              .order(sortBy, { ascending: sortOrder === 'asc' });
            return { properties: data || [], total };
          },
          staleTime: CACHE_TIMES.STANDARD,
        });
      }

      return { properties: propertiesWithMetrics, total };
    },
    enabled: !!user && enabled,
    staleTime: CACHE_TIMES.STANDARD,
    gcTime: CACHE_TIMES.MODERATE,
    // Enable background refetch for fresh data
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes in background
  });
};

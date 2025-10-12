import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { PropertyOwner } from '@/utils/propertyOwnerHelpers';

export const useOptimizedPropertyOwners = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['property_owners_optimized', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Use a single query with joins to get everything at once
      const { data: owners, error } = await supabase
        .from('property_owners')
        .select(`
          *,
          property_owner_associations(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!owners) return [];

      // Map the count from the association
      return owners.map(owner => ({
        ...owner,
        property_count: owner.property_owner_associations?.[0]?.count || 0
      })) as PropertyOwner[];
    },
    enabled: !!user,
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Server-side paginated version (when RPC is ready)
export const usePaginatedPropertyOwners = (
  limit: number = 50,
  offset: number = 0,
  searchTerm: string = '',
  statusFilter: 'all' | 'active' | 'archived' = 'all'
) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['property_owners_paginated', user?.id, limit, offset, searchTerm, statusFilter],
    queryFn: async () => {
      if (!user) return { owners: [], total: 0 };

      // For now, use client-side filtering
      // TODO: Replace with RPC function when database migration is approved
      let query = supabase
        .from('property_owners')
        .select(`
          *,
          property_owner_associations(count)
        `, { count: 'exact' })
        .eq('user_id', user.id);

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      // Apply search filter
      if (searchTerm) {
        query = query.or(
          `first_name.ilike.%${searchTerm}%,` +
          `last_name.ilike.%${searchTerm}%,` +
          `company_name.ilike.%${searchTerm}%,` +
          `email.ilike.%${searchTerm}%`
        );
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const owners = (data || []).map(owner => ({
        ...owner,
        property_count: owner.property_owner_associations?.[0]?.count || 0
      })) as PropertyOwner[];

      return {
        owners,
        total: count || 0
      };
    },
    enabled: !!user,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });
};

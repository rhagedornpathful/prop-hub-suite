import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '../use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type PropertyOwner = Tables<'property_owners'>;
type PropertyOwnerInsert = TablesInsert<'property_owners'>;
type PropertyOwnerUpdate = TablesUpdate<'property_owners'>;

export const usePropertyOwners = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['property_owners', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // First get the property owners
      const { data: owners, error: ownersError } = await supabase
        .from('property_owners')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ownersError) throw ownersError;
      if (!owners || owners.length === 0) return [];

      // Then get the property counts for each owner
      const ownerIds = owners.map(owner => owner.id);
      
      const { data: associations, error: associationsError } = await supabase
        .from('property_owner_associations')
        .select(`
          property_owner_id,
          property:properties(id, address)
        `)
        .in('property_owner_id', ownerIds);

      if (associationsError) throw associationsError;

      // Count properties for each owner
      const propertyCountsByOwner = (associations || []).reduce((acc, assoc) => {
        const ownerId = assoc.property_owner_id;
        acc[ownerId] = (acc[ownerId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Add property count to each owner
      return owners.map(owner => ({
        ...owner,
        property_count: propertyCountsByOwner[owner.id] || 0
      }));
    },
    enabled: !!user,
  });
};

export const usePropertyOwner = (ownerId: string | undefined) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['property_owner', ownerId, user?.id],
    queryFn: async () => {
      if (!user || !ownerId) return null;
      
      const { data, error } = await supabase
        .from('property_owners')
        .select('*')
        .eq('id', ownerId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!ownerId,
  });
};

export const useCreatePropertyOwner = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (owner: PropertyOwnerInsert) => {
      const { data, error } = await supabase
        .from('property_owners')
        .insert(owner)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Property owner created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['property_owners'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create property owner. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdatePropertyOwner = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: PropertyOwnerUpdate }) => {
      const { data, error } = await supabase
        .from('property_owners')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Property owner updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['property_owners'] });
      queryClient.invalidateQueries({ queryKey: ['property_owner'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update property owner. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useDeletePropertyOwner = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('property_owners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Property owner deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['property_owners'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete property owner. Please try again.",
        variant: "destructive",
      });
    },
  });
};
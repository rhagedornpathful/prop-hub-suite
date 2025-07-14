import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '../use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Property = Tables<'properties'>;
type PropertyInsert = TablesInsert<'properties'>;
type PropertyUpdate = TablesUpdate<'properties'>;

export const useProperties = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['properties', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const usePropertiesLimited = (limit: number = 6) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['properties', 'limited', limit, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
  });
};

export const useUnassignedProperties = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['properties', 'unassigned', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user.id)
        .is('owner_id', null)
        .order('address', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const usePropertiesByOwner = (ownerId: string | undefined) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['properties', 'by-owner', ownerId, user?.id],
    queryFn: async () => {
      if (!user || !ownerId) return [];
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user.id)
        .eq('owner_id', ownerId)
        .order('address', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!ownerId,
  });
};

export const usePropertyMetrics = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['property-metrics', user?.id],
    queryFn: async () => {
      if (!user) return { totalProperties: 0, totalRent: 0, occupiedUnits: 0 };

      const { data, error } = await supabase
        .from('properties')
        .select('monthly_rent, bedrooms, status')
        .eq('user_id', user.id);

      if (error) throw error;

      const properties = data || [];
      return {
        totalProperties: properties.length,
        totalRent: properties.reduce((sum, prop) => sum + (prop.monthly_rent || 0), 0),
        occupiedUnits: properties.filter(p => p.status === 'active').length,
      };
    },
    enabled: !!user,
  });
};

export const useCreateProperty = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (property: PropertyInsert) => {
      const { data, error } = await supabase
        .from('properties')
        .insert(property)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (newProperty) => {
      // Optimistic update
      const queryKey = ['properties', newProperty.user_id];
      await queryClient.cancelQueries({ queryKey });
      
      const previousProperties = queryClient.getQueryData(queryKey);
      
      const optimisticProperty = {
        ...newProperty,
        id: `temp-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      queryClient.setQueryData(queryKey, (old: Property[] = []) => [optimisticProperty, ...old]);
      
      return { previousProperties };
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousProperties) {
        queryClient.setQueryData(['properties', variables.user_id], context.previousProperties);
      }
      toast({
        title: "Error",
        description: "Failed to create property. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Property created successfully.",
      });
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property-metrics'] });
    },
  });
};

export const useUpdateProperty = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: PropertyUpdate }) => {
      console.log('🔄 Updating property:', id, 'with updates:', updates);
      
      const { data, error } = await supabase
        .from('properties')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Property update error:', error);
        throw error;
      }
      
      console.log('✅ Property update result:', data);
      return data;
    },
    onMutate: async ({ id, updates }) => {
      console.log('🔄 Optimistic update for property:', id, updates);
      
      // Optimistic update - fix the query key specificity
      const queryKeys = [
        ['properties'],
        ['properties', 'limited'],
        ['properties', 'by-owner'], 
        ['properties', 'unassigned']
      ];
      
      await Promise.all(queryKeys.map(key => queryClient.cancelQueries({ queryKey: key })));
      
      const previousData = queryClient.getQueryData(['properties']);
      
      queryClient.setQueriesData({ queryKey: ['properties'] }, (old: Property[] = []) => {
        const updated = old.map(property => 
          property.id === id 
            ? { ...property, ...updates, updated_at: new Date().toISOString() }
            : property
        );
        console.log('🔄 Optimistically updated properties list');
        return updated;
      });
      
      return { previousData };
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['properties'], context.previousData);
      }
      toast({
        title: "Error",
        description: "Failed to update property. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      console.log('✅ Property update successful, invalidating queries:', data);
      toast({
        title: "Success", 
        description: "Property updated successfully.",
      });
      // Invalidate all property queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property-metrics'] });
    },
  });
};

export const useDeleteProperty = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onMutate: async (id) => {
      const queryKey = ['properties'];
      await queryClient.cancelQueries({ queryKey });
      
      const previousData = queryClient.getQueryData(queryKey);
      
      queryClient.setQueriesData({ queryKey }, (old: Property[] = []) =>
        old.filter(property => property.id !== id)
      );
      
      return { previousData };
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['properties'], context.previousData);
      }
      toast({
        title: "Error",
        description: "Failed to delete property. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Property deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property-metrics'] });
    },
  });
};
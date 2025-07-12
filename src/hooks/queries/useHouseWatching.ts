import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '../use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type HouseWatching = Tables<'house_watching'>;
type HouseWatchingInsert = TablesInsert<'house_watching'>;
type HouseWatchingUpdate = TablesUpdate<'house_watching'>;

export const useHouseWatching = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['house-watching', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('house_watching')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useHouseWatchingLimited = (limit: number = 6) => {
  return useQuery({
    queryKey: ['house-watching', 'limited', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('house_watching')
        .select('*')
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
  });
};

export const useHouseWatchingMetrics = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['house-watching-metrics', user?.id],
    queryFn: async () => {
      if (!user) return { totalClients: 0, totalRevenue: 0, overdueCounts: 0 };

      const { data, error } = await supabase
        .from('house_watching')
        .select('monthly_fee, next_check_date, status')
        .eq('user_id', user.id);

      if (error) throw error;

      const houseWatching = data || [];
      const now = new Date();
      
      return {
        totalClients: houseWatching.length,
        totalRevenue: houseWatching.reduce((sum, hw) => sum + (hw.monthly_fee || 0), 0),
        overdueCounts: houseWatching.filter(hw => 
          hw.next_check_date && new Date(hw.next_check_date) < now
        ).length,
      };
    },
    enabled: !!user,
  });
};

export const useCreateHouseWatching = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (houseWatching: HouseWatchingInsert) => {
      const { data, error } = await supabase
        .from('house_watching')
        .insert(houseWatching)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (newHouseWatching) => {
      const queryKey = ['house-watching', newHouseWatching.user_id];
      await queryClient.cancelQueries({ queryKey });
      
      const previousData = queryClient.getQueryData(queryKey);
      
      const optimisticData = {
        ...newHouseWatching,
        id: `temp-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      queryClient.setQueryData(queryKey, (old: HouseWatching[] = []) => [optimisticData, ...old]);
      
      return { previousData };
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['house-watching', variables.user_id], context.previousData);
      }
      toast({
        title: "Error",
        description: "Failed to create house watching service. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "House watching service created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['house-watching'] });
      queryClient.invalidateQueries({ queryKey: ['house-watching-metrics'] });
    },
  });
};

export const useUpdateHouseWatching = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: HouseWatchingUpdate }) => {
      const { data, error } = await supabase
        .from('house_watching')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, updates }) => {
      const queryKey = ['house-watching'];
      await queryClient.cancelQueries({ queryKey });
      
      const previousData = queryClient.getQueryData(queryKey);
      
      queryClient.setQueriesData({ queryKey }, (old: HouseWatching[] = []) =>
        old.map(item => 
          item.id === id 
            ? { ...item, ...updates, updated_at: new Date().toISOString() }
            : item
        )
      );
      
      return { previousData };
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['house-watching'], context.previousData);
      }
      toast({
        title: "Error",
        description: "Failed to update house watching service. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "House watching service updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['house-watching'] });
    },
  });
};
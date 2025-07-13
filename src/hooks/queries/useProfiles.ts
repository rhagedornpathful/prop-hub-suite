import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '../use-toast';
import type { Tables, TablesUpdate } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type AppRole = 'admin' | 'property_manager' | 'house_watcher' | 'client' | 'contractor' | 'tenant' | 'owner_investor' | 'leasing_agent';

export const useProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useUserRoles = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) throw error;
      return data?.map(r => r.role as AppRole) || [];
    },
    enabled: !!user,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: TablesUpdate<'profiles'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (updates) => {
      if (!user) return;
      
      const queryKey = ['profile', user.id];
      await queryClient.cancelQueries({ queryKey });
      
      const previousProfile = queryClient.getQueryData(queryKey);
      
      queryClient.setQueryData(queryKey, (old: Profile | null) => 
        old ? { ...old, ...updates } : null
      );
      
      return { previousProfile };
    },
    onError: (error, variables, context) => {
      if (context?.previousProfile && user) {
        queryClient.setQueryData(['profile', user.id], context.previousProfile);
      }
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
    },
  });
};

export const useProfiles = () => {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name')
        .not('first_name', 'is', null)
        .not('last_name', 'is', null)
        .order('first_name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
};
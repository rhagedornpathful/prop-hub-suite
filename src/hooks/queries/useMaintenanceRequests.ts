import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '../use-toast';

export interface MaintenanceRequest {
  id: string;
  user_id: string;
  property_id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'scheduled' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  contractor_name: string | null;
  contractor_contact: string | null;
  estimated_cost: number | null;
  scheduled_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  properties?: {
    id: string;
    address: string;
    city: string | null;
    state: string | null;
    zip_code: string | null;
  };
}

export const useMaintenanceRequests = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['maintenance-requests'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select(`
          *,
          properties (
            id,
            address,
            city,
            state,
            zip_code
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MaintenanceRequest[];
    },
    enabled: !!user,
  });
};

export const useCreateMaintenanceRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (requestData: Omit<MaintenanceRequest, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'properties'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('maintenance_requests')
        .insert({
          ...requestData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      toast({
        title: "Success",
        description: "Maintenance request created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create maintenance request",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateMaintenanceRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MaintenanceRequest> }) => {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      toast({
        title: "Success",
        description: "Maintenance request updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update maintenance request",
        variant: "destructive",
      });
    },
  });
};
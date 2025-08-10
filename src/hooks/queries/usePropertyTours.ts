import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { toast } from "sonner";

type PropertyTour = Database['public']['Tables']['property_tours']['Row'];
type PropertyTourInsert = Database['public']['Tables']['property_tours']['Insert'];
type PropertyTourUpdate = Database['public']['Tables']['property_tours']['Update'];

export const usePropertyTours = () => {
  return useQuery({
    queryKey: ['property-tours'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_tours')
        .select(`
          *,
          properties (
            address,
            street_address,
            city,
            state,
            zip_code
          ),
          leads (
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};

export const usePropertyTour = (id: string) => {
  return useQuery({
    queryKey: ['property-tours', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_tours')
        .select(`
          *,
          properties (
            address,
            street_address,
            city,
            state,
            zip_code
          ),
          leads (
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useUpcomingTours = () => {
  const today = new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ['property-tours', 'upcoming'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_tours')
        .select(`
          *,
          properties (
            address,
            street_address,
            city,
            state,
            zip_code
          ),
          leads (
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .gte('scheduled_date', today)
        .in('status', ['scheduled', 'confirmed'])
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};

export const useCreatePropertyTour = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tourData: PropertyTourInsert) => {
      const { data, error } = await supabase
        .from('property_tours')
        .insert(tourData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-tours'] });
      toast.success('Tour scheduled successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to schedule tour: ${error.message}`);
    },
  });
};

export const useUpdatePropertyTour = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: PropertyTourUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('property_tours')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-tours'] });
      toast.success('Tour updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update tour: ${error.message}`);
    },
  });
};
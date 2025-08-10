import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { toast } from "sonner";

type RentalApplication = Database['public']['Tables']['rental_applications']['Row'];
type RentalApplicationInsert = Database['public']['Tables']['rental_applications']['Insert'];
type RentalApplicationUpdate = Database['public']['Tables']['rental_applications']['Update'];

export const useRentalApplications = () => {
  return useQuery({
    queryKey: ['rental-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rental_applications')
        .select(`
          *,
          properties (
            address,
            street_address,
            city,
            state,
            zip_code
          ),
          property_listings (
            title,
            rent_amount
          ),
          leads (
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useRentalApplication = (id: string) => {
  return useQuery({
    queryKey: ['rental-applications', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rental_applications')
        .select(`
          *,
          properties (
            address,
            street_address,
            city,
            state,
            zip_code
          ),
          property_listings (
            title,
            rent_amount
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

export const useCreateRentalApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (applicationData: RentalApplicationInsert) => {
      const { data, error } = await supabase
        .from('rental_applications')
        .insert(applicationData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rental-applications'] });
      toast.success('Application submitted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit application: ${error.message}`);
    },
  });
};

export const useUpdateRentalApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: RentalApplicationUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('rental_applications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rental-applications'] });
      toast.success('Application updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update application: ${error.message}`);
    },
  });
};
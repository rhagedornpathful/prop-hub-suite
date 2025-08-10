import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { toast } from "sonner";

type PropertyListing = Database['public']['Tables']['property_listings']['Row'];
type PropertyListingInsert = Database['public']['Tables']['property_listings']['Insert'];
type PropertyListingUpdate = Database['public']['Tables']['property_listings']['Update'];

export const usePropertyListings = () => {
  return useQuery({
    queryKey: ['property-listings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_listings')
        .select(`
          *,
          properties (
            address,
            street_address,
            city,
            state,
            zip_code,
            bedrooms,
            bathrooms,
            square_feet,
            images
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const usePropertyListing = (id: string) => {
  return useQuery({
    queryKey: ['property-listings', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_listings')
        .select(`
          *,
          properties (
            address,
            street_address,
            city,
            state,
            zip_code,
            bedrooms,
            bathrooms,
            square_feet,
            images
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

export const useActiveListings = () => {
  return useQuery({
    queryKey: ['property-listings', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_listings')
        .select(`
          *,
          properties (
            address,
            street_address,
            city,
            state,
            zip_code,
            bedrooms,
            bathrooms,
            square_feet,
            images
          )
        `)
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useCreatePropertyListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingData: PropertyListingInsert) => {
      const { data, error } = await supabase
        .from('property_listings')
        .insert(listingData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-listings'] });
      toast.success('Property listing created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create listing: ${error.message}`);
    },
  });
};

export const useUpdatePropertyListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: PropertyListingUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('property_listings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-listings'] });
      toast.success('Listing updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update listing: ${error.message}`);
    },
  });
};

export const useDeletePropertyListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('property_listings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-listings'] });
      toast.success('Listing deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete listing: ${error.message}`);
    },
  });
};
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Service {
  id: string;
  name: string;
  description: string | null;
  category: 'house_watching' | 'property_management' | 'add_on';
  package_tier: string | null;
  base_price: number;
  rent_percentage: number;
  billing_type: 'monthly' | 'percentage' | 'one_time' | 'quote_based';
  features: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const useServices = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) {
        console.error('Services error:', error);
        throw error;
      }

      return data as Service[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useServicesByCategory = (category: Service['category']) => {
  return useQuery({
    queryKey: ['services', 'category', category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('sort_order');

      if (error) {
        console.error('Services by category error:', error);
        throw error;
      }

      return data as Service[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useService = (id: string) => {
  return useQuery({
    queryKey: ['services', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Service error:', error);
        throw error;
      }

      return data as Service;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export interface ServiceInsert {
  name: string;
  description: string | null;
  category: 'house_watching' | 'property_management' | 'add_on';
  package_tier: string | null;
  base_price: number;
  rent_percentage: number;
  billing_type: 'monthly' | 'percentage' | 'one_time' | 'quote_based';
  features: string[];
  sort_order: number;
}

export interface ServiceUpdate {
  name?: string;
  description?: string | null;
  category?: 'house_watching' | 'property_management' | 'add_on';
  package_tier?: string | null;
  base_price?: number;
  rent_percentage?: number;
  billing_type?: 'monthly' | 'percentage' | 'one_time' | 'quote_based';
  features?: string[];
  sort_order?: number;
  is_active?: boolean;
}

export const useCreateService = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (service: ServiceInsert) => {
      const { data, error } = await supabase
        .from('services')
        .insert([service])
        .select()
        .single();

      if (error) {
        console.error('Create service error:', error);
        throw error;
      }

      return data as Service;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ServiceUpdate }) => {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Update service error:', error);
        throw error;
      }

      return data as Service;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete service error:', error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};
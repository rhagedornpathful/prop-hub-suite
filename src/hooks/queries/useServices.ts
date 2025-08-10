import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
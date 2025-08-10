import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PropertyServiceAssignment {
  id: string;
  property_id: string;
  service_id: string;
  assigned_by: string;
  monthly_fee: number;
  rent_percentage: number;
  billing_start_date: string;
  billing_end_date?: string;
  status: 'active' | 'inactive' | 'pending';
  stripe_subscription_id?: string;
  created_at: string;
  updated_at: string;
  // Relations
  service?: {
    id: string;
    name: string;
    description: string;
    category: string;
    package_tier: string;
    base_price: number;
    billing_type: string;
  };
  property?: {
    id: string;
    address: string;
  };
}

export interface PropertyServiceAssignmentInsert {
  property_id: string;
  service_id: string;
  monthly_fee: number;
  rent_percentage: number;
  billing_start_date: string;
  billing_end_date?: string;
  status?: 'active' | 'inactive' | 'pending';
}

export const usePropertyServiceAssignments = (propertyId?: string) => {
  return useQuery({
    queryKey: ['property-service-assignments', propertyId],
    queryFn: async () => {
      // Temporarily return empty array until migration is applied
      console.log('Property service assignments query - migration pending');
      return [] as PropertyServiceAssignment[];
    },
    enabled: true,
    staleTime: 30000, // 30 seconds
  });
};

export const useCreatePropertyServiceAssignment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (assignment: PropertyServiceAssignmentInsert) => {
      // Temporarily log and return mock success until migration is applied
      console.log('Create assignment requested:', assignment);
      toast({
        title: "Migration Pending",
        description: "Service assignment feature will be available after database migration is applied",
        variant: "default",
      });
      return { id: 'mock-id', ...assignment };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['property-service-assignments'] });
    },
  });
};

export const useUpdatePropertyServiceAssignment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<PropertyServiceAssignmentInsert> 
    }) => {
      console.log('Update assignment requested:', { id, updates });
      return { id, ...updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-service-assignments'] });
    },
  });
};

export const useDeletePropertyServiceAssignment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Delete assignment requested:', id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-service-assignments'] });
    },
  });
};
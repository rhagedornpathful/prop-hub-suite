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
  assigned_by: string;
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
      let query = supabase
        .from('property_service_assignments')
        .select(`
          *,
          service:services(*),
          property:properties(id, address)
        `);
      
      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as unknown as PropertyServiceAssignment[];
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
      const { data, error } = await supabase
        .from('property_service_assignments')
        .insert(assignment)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['property-service-assignments'] });
      toast({
        title: "Success",
        description: "Service package assigned successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to assign service package",
        variant: "destructive",
      });
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
      const { data, error } = await supabase
        .from('property_service_assignments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-service-assignments'] });
      toast({
        title: "Success",
        description: "Service assignment updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update service assignment",
        variant: "destructive",
      });
    },
  });
};

export const useDeletePropertyServiceAssignment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('property_service_assignments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-service-assignments'] });
      toast({
        title: "Success",
        description: "Service assignment deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete service assignment",
        variant: "destructive",
      });
    },
  });
};
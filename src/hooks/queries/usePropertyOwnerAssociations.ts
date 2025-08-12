import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '../use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type PropertyOwnerAssociation = Tables<'property_owner_associations'>;
type PropertyOwnerAssociationInsert = TablesInsert<'property_owner_associations'>;
type PropertyOwnerAssociationUpdate = TablesUpdate<'property_owner_associations'>;

export interface PropertyOwnerAssociationWithDetails extends PropertyOwnerAssociation {
  property?: {
    id: string;
    address: string;
  };
  property_owner?: {
    id: string;
    first_name: string;
    last_name: string;
    company_name?: string;
  };
}

export const usePropertyOwnerAssociations = (propertyId?: string) => {
  return useQuery({
    queryKey: ['property_owner_associations', propertyId],
    queryFn: async () => {
      let query = supabase
        .from('property_owner_associations')
        .select(`
          *,
          property:properties(id, address),
          property_owner:property_owners(id, first_name, last_name, company_name)
        `);
      
      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }
      
      const { data, error } = await query.order('ownership_percentage', { ascending: false });
      
      if (error) throw error;
      return (data || []) as unknown as PropertyOwnerAssociationWithDetails[];
    },
    enabled: true,
  });
};

export const useCreatePropertyOwnerAssociation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (association: PropertyOwnerAssociationInsert) => {
      const { data, error } = await supabase
        .from('property_owner_associations')
        .insert(association)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Property owner association created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['property_owner_associations'] });
      queryClient.invalidateQueries({ queryKey: ['property_owners'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create property owner association.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdatePropertyOwnerAssociation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: PropertyOwnerAssociationUpdate }) => {
      const { data, error } = await supabase
        .from('property_owner_associations')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Property owner association updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['property_owner_associations'] });
      queryClient.invalidateQueries({ queryKey: ['property_owners'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update property owner association.",
        variant: "destructive",
      });
    },
  });
};

export const useDeletePropertyOwnerAssociation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('property_owner_associations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Property owner association deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['property_owner_associations'] });
      queryClient.invalidateQueries({ queryKey: ['property_owners'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete property owner association.",
        variant: "destructive",
      });
    },
  });
};
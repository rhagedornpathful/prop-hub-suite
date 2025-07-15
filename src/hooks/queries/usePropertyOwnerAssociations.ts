import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type PropertyOwnerAssociation = Tables<'property_owner_associations'>;
type PropertyOwnerAssociationInsert = TablesInsert<'property_owner_associations'>;
type PropertyOwnerAssociationUpdate = TablesUpdate<'property_owner_associations'>;

export interface PropertyOwnerAssociationWithOwner extends PropertyOwnerAssociation {
  property_owner: Tables<'property_owners'>;
}

// Fetch property owner associations for a property
export const usePropertyOwnerAssociations = (propertyId: string | undefined) => {
  return useQuery({
    queryKey: ['property-owner-associations', propertyId],
    queryFn: async () => {
      if (!propertyId) return [];
      
      const { data, error } = await supabase
        .from('property_owner_associations')
        .select(`
          *,
          property_owner:property_owners(*)
        `)
        .eq('property_id', propertyId)
        .order('is_primary_owner', { ascending: false });

      if (error) throw error;
      return data as PropertyOwnerAssociationWithOwner[];
    },
    enabled: !!propertyId,
  });
};

// Create property owner association
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
      queryClient.invalidateQueries({ queryKey: ['property-owner-associations', data.property_id] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast({
        title: "Success",
        description: "Property owner association created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create property owner association. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Update property owner association
export const useUpdatePropertyOwnerAssociation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: PropertyOwnerAssociationUpdate }) => {
      const { data, error } = await supabase
        .from('property_owner_associations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['property-owner-associations', data.property_id] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast({
        title: "Success",
        description: "Property owner association updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update property owner association. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Delete property owner association
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
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['property-owner-associations'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast({
        title: "Success",
        description: "Property owner association deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete property owner association. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Bulk update property owner associations for a property
export const useBulkUpdatePropertyOwnerAssociations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      propertyId, 
      associations 
    }: { 
      propertyId: string; 
      associations: PropertyOwnerAssociationInsert[] 
    }) => {
      // First, delete existing associations for this property
      const { error: deleteError } = await supabase
        .from('property_owner_associations')
        .delete()
        .eq('property_id', propertyId);

      if (deleteError) throw deleteError;

      // Then insert new associations
      if (associations.length > 0) {
        const { data, error: insertError } = await supabase
          .from('property_owner_associations')
          .insert(associations)
          .select();

        if (insertError) throw insertError;
        return data;
      }

      return [];
    },
    onSuccess: (_, { propertyId }) => {
      queryClient.invalidateQueries({ queryKey: ['property-owner-associations', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast({
        title: "Success",
        description: "Property owner associations updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update property owner associations. Please try again.",
        variant: "destructive",
      });
    },
  });
};
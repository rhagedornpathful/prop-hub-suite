import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDeleteProperty = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (propertyId: string) => {
      // First check if property has tenants
      const { data: tenants, error: tenantsError } = await supabase
        .from('tenants')
        .select('id')
        .eq('property_id', propertyId);

      if (tenantsError) throw tenantsError;

      if (tenants && tenants.length > 0) {
        throw new Error('Cannot delete property with active tenants. Please remove all tenants first.');
      }

      // Check for maintenance requests
      const { data: maintenanceRequests, error: maintenanceError } = await supabase
        .from('maintenance_requests')
        .select('id')
        .eq('property_id', propertyId);

      if (maintenanceError) throw maintenanceError;

      if (maintenanceRequests && maintenanceRequests.length > 0) {
        throw new Error('Cannot delete property with existing maintenance requests. Please resolve or remove them first.');
      }

      // Delete property
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;

      return propertyId;
    },
    onSuccess: () => {
      toast({
        title: "Property Deleted",
        description: "Property has been successfully removed from the system.",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete property",
        variant: "destructive"
      });
    }
  });
};
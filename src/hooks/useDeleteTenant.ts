import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDeleteTenant = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (tenantId: string) => {
      // Check for active lease
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('lease_end_date, first_name, last_name')
        .eq('id', tenantId)
        .single();

      if (tenantError) throw tenantError;

      // Check if lease is still active
      if (tenant.lease_end_date && new Date(tenant.lease_end_date) > new Date()) {
        throw new Error('Cannot delete tenant with active lease. Please end the lease first.');
      }

      // Delete tenant
      const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', tenantId);

      if (error) throw error;

      return { tenantId, tenant };
    },
    onSuccess: (data) => {
      toast({
        title: "Tenant Removed",
        description: `${data.tenant.first_name} ${data.tenant.last_name} has been removed from the system.`,
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to remove tenant",
        variant: "destructive"
      });
    }
  });
};
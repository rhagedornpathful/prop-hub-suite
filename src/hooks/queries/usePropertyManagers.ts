import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type PropertyManager = Tables<'property_manager_assignments'> & {
  user_profiles?: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
  };
  assigned_properties?: number;
  user_id?: string;
  created_at?: string;
};

export const usePropertyManagers = () => {
  return useQuery({
    queryKey: ["property-managers"],
    queryFn: async (): Promise<PropertyManager[]> => {
      const { data, error } = await supabase
        .from('property_manager_assignments')
        .select('*')
        .order('assigned_at', { ascending: false });

      if (error) {
        console.error('Error fetching property managers:', error);
        throw error;
      }

      // Get user profiles and property count for each property manager
      const managersWithProfiles = await Promise.all(
        (data || []).map(async (assignment) => {
          // Get user profile from profiles table
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('user_id, first_name, last_name, phone, address, city, state, zip_code')
            .eq('user_id', assignment.manager_user_id)
            .limit(1)
            .single();

          if (profileError) {
            console.error('Error fetching profile for user:', assignment.manager_user_id, profileError);
          }

          // Get property count for this manager
          const { count } = await supabase
            .from('property_manager_assignments')
            .select('*', { count: 'exact', head: true })
            .eq('manager_user_id', assignment.manager_user_id);
          
          return {
            ...assignment,
            user_id: assignment.manager_user_id,
            created_at: assignment.assigned_at,
            user_profiles: profileData ? {
              id: profileData.user_id,
              email: '', // Not available in profiles table
              first_name: profileData.first_name || '',
              last_name: profileData.last_name || '',
              phone: profileData.phone || '',
              address: profileData.address || '',
              city: profileData.city || '',
              state: profileData.state || '',
              zip_code: profileData.zip_code || ''
            } : null,
            assigned_properties: count || 0
          };
        })
      );

      return managersWithProfiles;
    }
  });
};

export const useDeletePropertyManager = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (managerId: string) => {
      // Delete the property manager assignment
      const { error } = await supabase
        .from('property_manager_assignments')
        .delete()
        .eq('id', managerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-managers"] });
      toast({
        title: "Property Manager Removed",
        description: "Property manager has been successfully removed from the system.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove property manager",
        variant: "destructive",
      });
    }
  });
};

export const useAssignPropertyToManager = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ managerId, propertyId }: { 
      managerId: string; 
      propertyId: string; 
    }) => {
      const { error } = await supabase
        .from('property_manager_assignments')
        .insert({
          manager_user_id: managerId,
          property_id: propertyId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-managers"] });
      toast({
        title: "Property Assigned",
        description: "Property has been successfully assigned to property manager.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign property",
        variant: "destructive",
      });
    }
  });
};
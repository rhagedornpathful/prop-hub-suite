import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type HouseWatcher = Tables<'house_watchers'> & {
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
};

export const useHouseWatchers = () => {
  return useQuery({
    queryKey: ["house-watchers"],
    queryFn: async (): Promise<HouseWatcher[]> => {
      const { data, error } = await supabase
        .from('house_watchers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching house watchers:', error);
        throw error;
      }

      // Get property count for each house watcher
      const watchersWithCount = await Promise.all(
        (data || []).map(async (watcher) => {
          const { count } = await supabase
            .from('house_watcher_properties')
            .select('*', { count: 'exact', head: true })
            .eq('house_watcher_id', watcher.id);
          
          return {
            ...watcher,
            assigned_properties: count || 0
          };
        })
      );

      return watchersWithCount;
    }
  });
};

export const useDeleteHouseWatcher = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (watcherId: string) => {
      // First delete all property assignments
      const { error: assignmentError } = await supabase
        .from('house_watcher_properties')
        .delete()
        .eq('house_watcher_id', watcherId);

      if (assignmentError) throw assignmentError;

      // Then delete the house watcher
      const { error } = await supabase
        .from('house_watchers')
        .delete()
        .eq('id', watcherId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["house-watchers"] });
      toast({
        title: "House Watcher Removed",
        description: "House watcher has been successfully removed from the system.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove house watcher",
        variant: "destructive",
      });
    }
  });
};

export const useAssignProperty = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ watcherId, propertyId, notes }: { 
      watcherId: string; 
      propertyId: string; 
      notes?: string; 
    }) => {
      const { error } = await supabase
        .from('house_watcher_properties')
        .insert({
          house_watcher_id: watcherId,
          property_id: propertyId,
          notes
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["house-watchers"] });
      toast({
        title: "Property Assigned",
        description: "Property has been successfully assigned to house watcher.",
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
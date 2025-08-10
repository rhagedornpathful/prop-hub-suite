import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type PropertyListing = Database["public"]["Tables"]["property_listings"]["Row"];
type PropertyListingInsert = Database["public"]["Tables"]["property_listings"]["Insert"];
type PropertyListingUpdate = Database["public"]["Tables"]["property_listings"]["Update"];

export const usePropertyListings = () => {
  return useQuery({
    queryKey: ["property_listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property_listings")
        .select(`
          *,
          properties:property_id (
            address,
            street_address,
            city,
            state,
            zip_code
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PropertyListing[];
    },
  });
};

export const useCreatePropertyListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listing: PropertyListingInsert) => {
      const { data, error } = await supabase
        .from("property_listings")
        .insert([listing])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property_listings"] });
      toast.success("Property listing created successfully");
    },
    onError: (error) => {
      console.error("Error creating property listing:", error);
      toast.error("Failed to create property listing");
    },
  });
};

export const useUpdatePropertyListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: PropertyListingUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("property_listings")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property_listings"] });
      toast.success("Property listing updated successfully");
    },
    onError: (error) => {
      console.error("Error updating property listing:", error);
      toast.error("Failed to update property listing");
    },
  });
};
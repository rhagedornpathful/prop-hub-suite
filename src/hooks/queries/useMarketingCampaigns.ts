import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type MarketingCampaign = Database["public"]["Tables"]["marketing_campaigns"]["Row"];
type MarketingCampaignInsert = Database["public"]["Tables"]["marketing_campaigns"]["Insert"];
type MarketingCampaignUpdate = Database["public"]["Tables"]["marketing_campaigns"]["Update"];

export const useMarketingCampaigns = () => {
  return useQuery({
    queryKey: ["marketing_campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketing_campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as MarketingCampaign[];
    },
  });
};

export const useCreateMarketingCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaign: MarketingCampaignInsert) => {
      const { data, error } = await supabase
        .from("marketing_campaigns")
        .insert([campaign])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing_campaigns"] });
      toast.success("Marketing campaign created successfully");
    },
    onError: (error) => {
      console.error("Error creating marketing campaign:", error);
      toast.error("Failed to create marketing campaign");
    },
  });
};

export const useUpdateMarketingCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: MarketingCampaignUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("marketing_campaigns")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing_campaigns"] });
      toast.success("Marketing campaign updated successfully");
    },
    onError: (error) => {
      console.error("Error updating marketing campaign:", error);
      toast.error("Failed to update marketing campaign");
    },
  });
};
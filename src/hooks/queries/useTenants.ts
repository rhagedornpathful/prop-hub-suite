import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Tenant {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  property_id: string;
  monthly_rent: number | null;
  lease_start_date: string | null;
  lease_end_date: string | null;
  security_deposit: number | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  user_account_id: string | null;
  // Property relationship
  property?: {
    id: string;
    address: string;
    city: string | null;
    state: string | null;
  };
}

export const useTenants = () => {
  return useQuery({
    queryKey: ["tenants"],
    queryFn: async () => {
      console.log("📋 Fetching tenants from database...");
      
      const { data: tenants, error } = await supabase
        .from("tenants")
        .select(`
          *,
          property:properties(
            id,
            address,
            city,
            state
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Error fetching tenants:", error);
        throw error;
      }

      console.log("✅ Tenants fetched successfully:", tenants);
      return tenants as Tenant[];
    },
  });
};
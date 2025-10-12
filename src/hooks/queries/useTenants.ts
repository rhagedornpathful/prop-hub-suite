import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user, activeRole, actualRole } = useAuth();

  return useQuery({
    queryKey: ["tenants", user?.id, activeRole],
    queryFn: async () => {
      if (!user) return [];

      console.log("📋 Fetching tenants from database...");
      
      const effectiveRole = activeRole || actualRole;

      // Build query
      let query = supabase
        .from("tenants")
        .select(`
          *,
          property:properties(
            id,
            address,
            city,
            state
          )
        `);

      // Filter by role - property owners only see tenants in their properties
      if (effectiveRole === 'owner_investor') {
        // Get properties where user is associated as owner
        const { data: ownerData } = await supabase
          .from('property_owners')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (ownerData) {
          const { data: associations } = await supabase
            .from('property_owner_associations')
            .select('property_id')
            .eq('property_owner_id', ownerData.id);

          const propertyIds = associations?.map(a => a.property_id) || [];
          
          if (propertyIds.length === 0) {
            return [];
          }

          query = query.in('property_id', propertyIds);
        } else {
          return [];
        }
      }

      const { data: tenants, error } = await query.order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Error fetching tenants:", error);
        throw error;
      }

      console.log("✅ Tenants fetched successfully:", tenants);
      return tenants as Tenant[];
    },
    enabled: !!user,
  });
};
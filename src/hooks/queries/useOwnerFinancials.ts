import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface OwnerStatement {
  id: string;
  owner_id: string;
  property_id: string | null;
  statement_period_start: string;
  statement_period_end: string;
  total_rent_collected: number;
  total_expenses: number;
  management_fees: number;
  net_amount: number;
  status: "draft" | "sent" | "paid";
  generated_at: string;
  sent_at: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  statement_data: any;
}

export interface RentRoll {
  id: string;
  property_id: string;
  tenant_id: string | null;
  month_year: string;
  rent_amount: number;
  amount_collected: number;
  late_fees: number;
  other_charges: number;
  status: "due" | "partial" | "paid" | "late" | "void";
  due_date: string | null;
  paid_date: string | null;
  created_at: string;
  updated_at: string;
}

export const useOwnerStatements = () => {
  return useQuery({
    queryKey: ["owner-statements"],
    queryFn: async () => {
      console.log("📊 Fetching owner statements from database...");
      
      const { data: statements, error } = await supabase
        .from("owner_statements")
        .select("*")
        .order("statement_period_start", { ascending: false });

      if (error) {
        console.error("❌ Error fetching owner statements:", error);
        throw error;
      }

      console.log("✅ Owner statements fetched successfully:", statements);
      return statements as OwnerStatement[];
    },
  });
};

export const useRentRolls = () => {
  return useQuery({
    queryKey: ["rent-rolls"],
    queryFn: async () => {
      console.log("📋 Fetching rent rolls from database...");
      
      const { data: rentRolls, error } = await supabase
        .from("rent_rolls")
        .select("*")
        .order("month_year", { ascending: false });

      if (error) {
        console.error("❌ Error fetching rent rolls:", error);
        throw error;
      }

      console.log("✅ Rent rolls fetched successfully:", rentRolls);
      return rentRolls as RentRoll[];
    },
  });
};

export const useOwnerFinancialSummary = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["owner-financial-summary", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      console.log("💰 Fetching owner financial summary...");

      // Get owner properties
      const { data: properties, error: propertiesError } = await supabase
        .from("properties")
        .select(`
          id,
          address,
          monthly_rent,
          owner_id,
          property_owners!inner(user_id)
        `)
        .eq("property_owners.user_id", user.id);

      if (propertiesError) {
        console.error("❌ Error fetching properties:", propertiesError);
        throw propertiesError;
      }

      // Get payments for these properties
      const propertyIds = properties?.map(p => p.id) || [];
      
      const { data: payments, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .in("property_id", propertyIds)
        .eq("status", "succeeded");

      if (paymentsError) {
        console.error("❌ Error fetching payments:", paymentsError);
        throw paymentsError;
      }

      // Calculate summary
      const totalProperties = properties?.length || 0;
      const totalMonthlyRent = properties?.reduce((sum, p) => sum + (p.monthly_rent || 0), 0) || 0;
      const totalCollected = payments?.reduce((sum, p) => sum + (p.amount / 100), 0) || 0;
      const averageRent = totalProperties > 0 ? totalMonthlyRent / totalProperties : 0;

      const summary = {
        totalProperties,
        totalMonthlyRent,
        totalCollected,
        averageRent,
        properties: properties || [],
        recentPayments: payments?.slice(0, 10) || []
      };

      console.log("✅ Financial summary calculated:", summary);
      return summary;
    },
    enabled: !!user,
  });
};
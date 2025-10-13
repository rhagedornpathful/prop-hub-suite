import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

type Payment = Tables<"payments">;
type Subscription = Tables<"subscriptions">;

export interface CreatePaymentData {
  amount: number;
  currency?: string;
  payment_type: "rent" | "deposit" | "fee" | "service" | "late_fee" | "application";
  description?: string;
  property_id?: string;
  tenant_id?: string;
  metadata?: Record<string, any>;
}

export interface CreateSubscriptionData {
  amount: number;
  currency?: string;
  plan_type: "rent" | "property_management" | "house_watching";
  interval?: "month" | "year";
  description?: string;
  property_id?: string;
  tenant_id?: string;
  metadata?: Record<string, any>;
}

export const usePayments = () => {
  const { user, activeRole, actualRole } = useAuth();

  return useQuery({
    queryKey: ["payments", user?.id, activeRole],
    queryFn: async () => {
      if (!user) return [];

      console.log("📋 Fetching payments from database...");
      
      const effectiveRole = activeRole || actualRole;

      // Build query
      let query = supabase
        .from("payments")
        .select("*");

      // Filter by role
      if (effectiveRole === 'owner_investor') {
        // Property owners only see payments for their properties
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
      } else if (effectiveRole === 'tenant') {
        // Tenants only see their own payments
        const { data: tenantData } = await supabase
          .from('tenants')
          .select('id, property_id')
          .eq('user_account_id', user.id)
          .single();

        if (tenantData) {
          // See payments linked to their tenant_id OR property OR user_id
          query = query.or(`tenant_id.eq.${tenantData.id},property_id.eq.${tenantData.property_id},user_id.eq.${user.id}`);
        } else {
          // Only see payments directly linked to their user_id
          query = query.eq('user_id', user.id);
        }
      } else if (effectiveRole === 'property_manager') {
        // Property managers see payments for their assigned properties
        const { data: assignments } = await supabase
          .from('property_manager_assignments')
          .select('property_id')
          .eq('manager_user_id', user.id);

        const propertyIds = assignments?.map(a => a.property_id) || [];
        
        if (propertyIds.length === 0) {
          return [];
        }

        query = query.in('property_id', propertyIds);
      }
      // Admin sees all payments (no filter needed)

      const { data: payments, error } = await query.order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Error fetching payments:", error);
        throw error;
      }

      console.log("✅ Payments fetched successfully:", payments);
      return payments as Payment[];
    },
    enabled: !!user,
  });
};

export const useSubscriptions = () => {
  const { user, activeRole, actualRole } = useAuth();

  return useQuery({
    queryKey: ["subscriptions", user?.id, activeRole],
    queryFn: async () => {
      if (!user) return [];

      console.log("📋 Fetching subscriptions from database...");
      
      const effectiveRole = activeRole || actualRole;

      // Build query
      let query = supabase
        .from("subscriptions")
        .select("*");

      // Filter by role
      if (effectiveRole === 'owner_investor') {
        // Property owners only see subscriptions for their properties
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
      } else if (effectiveRole === 'tenant') {
        // Tenants only see their own subscriptions
        const { data: tenantData } = await supabase
          .from('tenants')
          .select('id, property_id')
          .eq('user_account_id', user.id)
          .single();

        if (tenantData) {
          // See subscriptions linked to their tenant_id OR property OR user_id
          query = query.or(`tenant_id.eq.${tenantData.id},property_id.eq.${tenantData.property_id},user_id.eq.${user.id}`);
        } else {
          // Only see subscriptions directly linked to their user_id
          query = query.eq('user_id', user.id);
        }
      } else if (effectiveRole === 'property_manager') {
        // Property managers see subscriptions for their assigned properties
        const { data: assignments } = await supabase
          .from('property_manager_assignments')
          .select('property_id')
          .eq('manager_user_id', user.id);

        const propertyIds = assignments?.map(a => a.property_id) || [];
        
        if (propertyIds.length === 0) {
          return [];
        }

        query = query.in('property_id', propertyIds);
      }
      // Admin sees all subscriptions (no filter needed)

      const { data: subscriptions, error } = await query.order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Error fetching subscriptions:", error);
        throw error;
      }

      console.log("✅ Subscriptions fetched successfully:", subscriptions);
      return subscriptions as Subscription[];
    },
    enabled: !!user,
  });
};

export const useCreatePayment = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentData: CreatePaymentData) => {
      console.log("💳 Creating payment...", paymentData);

      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: paymentData,
      });

      if (error) {
        console.error("❌ Error creating payment:", error);
        throw error;
      }

      console.log("✅ Payment created successfully:", data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast({
        title: "Payment Created",
        description: "Redirecting to payment page...",
      });
      
      // Open Stripe checkout in a new tab
      if (data.url) {
        window.open(data.url, '_blank');
      }
    },
    onError: (error) => {
      console.error("❌ Payment creation failed:", error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Failed to create payment",
        variant: "destructive",
      });
    },
  });
};

export const useCreateSubscription = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subscriptionData: CreateSubscriptionData) => {
      console.log("🔄 Creating subscription...", subscriptionData);

      const { data, error } = await supabase.functions.invoke("create-subscription", {
        body: subscriptionData,
      });

      if (error) {
        console.error("❌ Error creating subscription:", error);
        throw error;
      }

      console.log("✅ Subscription created successfully:", data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast({
        title: "Subscription Created",
        description: "Redirecting to payment page...",
      });
      
      // Open Stripe checkout in a new tab
      if (data.url) {
        window.open(data.url, '_blank');
      }
    },
    onError: (error) => {
      console.error("❌ Subscription creation failed:", error);
      toast({
        title: "Subscription Failed",
        description: error instanceof Error ? error.message : "Failed to create subscription",
        variant: "destructive",
      });
    },
  });
};

export const useVerifyPayment = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      console.log("🔍 Verifying payment...", sessionId);

      const { data, error } = await supabase.functions.invoke("verify-payment", {
        body: { session_id: sessionId },
      });

      if (error) {
        console.error("❌ Error verifying payment:", error);
        throw error;
      }

      console.log("✅ Payment verified successfully:", data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      
      if (data.success) {
        toast({
          title: "Payment Verified",
          description: data.type === "subscription" 
            ? "Your subscription is now active!" 
            : "Your payment was successful!",
        });
      } else {
        toast({
          title: "Payment Verification Failed",
          description: data.error || "Unable to verify payment",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error("❌ Payment verification failed:", error);
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Failed to verify payment",
        variant: "destructive",
      });
    },
  });
};

export const useCustomerPortal = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      console.log("🏛️ Creating customer portal session...");

      const { data, error } = await supabase.functions.invoke("customer-portal");

      if (error) {
        console.error("❌ Error creating customer portal:", error);
        throw error;
      }

      console.log("✅ Customer portal created successfully:", data);
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Redirecting to Customer Portal",
        description: "Opening payment management...",
      });
      
      // Open customer portal in a new tab
      if (data.url) {
        window.open(data.url, '_blank');
      }
    },
    onError: (error) => {
      console.error("❌ Customer portal creation failed:", error);
      toast({
        title: "Portal Access Failed",
        description: error instanceof Error ? error.message : "Failed to access customer portal",
        variant: "destructive",
      });
    },
  });
};
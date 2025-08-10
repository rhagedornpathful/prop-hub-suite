import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  return useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      console.log("📋 Fetching payments from database...");
      
      const { data: payments, error } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Error fetching payments:", error);
        throw error;
      }

      console.log("✅ Payments fetched successfully:", payments);
      return payments as Payment[];
    },
  });
};

export const useSubscriptions = () => {
  return useQuery({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      console.log("📋 Fetching subscriptions from database...");
      
      const { data: subscriptions, error } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Error fetching subscriptions:", error);
        throw error;
      }

      console.log("✅ Subscriptions fetched successfully:", subscriptions);
      return subscriptions as Subscription[];
    },
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
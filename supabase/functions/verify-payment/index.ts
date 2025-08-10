import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Parse request body
    const { session_id } = await req.json();

    if (!session_id) {
      throw new Error("Session ID is required");
    }

    logStep("Session ID provided", { session_id });

    // Create service client for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);
    logStep("Retrieved Stripe session", { 
      status: session.payment_status, 
      mode: session.mode,
      paymentIntent: session.payment_intent,
      subscription: session.subscription
    });

    if (session.mode === "payment" && session.payment_status === "paid") {
      // Handle one-time payment
      const { error: updateError } = await supabaseService
        .from("payments")
        .update({
          status: "succeeded",
          paid_at: new Date().toISOString(),
          stripe_payment_intent_id: session.payment_intent as string,
          metadata: {
            ...session.metadata,
            stripe_session_id: session_id,
            payment_intent_id: session.payment_intent
          }
        })
        .eq("stripe_payment_intent_id", session_id);

      if (updateError) {
        logStep("Error updating payment record", { error: updateError });
        throw new Error(`Failed to update payment: ${updateError.message}`);
      }

      logStep("Payment updated successfully");

      return new Response(JSON.stringify({ 
        success: true, 
        payment_status: "succeeded",
        type: "payment"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } else if (session.mode === "subscription" && session.subscription) {
      // Handle subscription
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      
      logStep("Retrieved subscription", { 
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end
      });

      // Create or update subscription record
      const subscriptionData = {
        user_id: session.metadata?.user_id,
        property_id: session.metadata?.property_id || null,
        tenant_id: session.metadata?.tenant_id || null,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer as string,
        plan_type: session.metadata?.plan_type || "rent",
        amount: subscription.items.data[0].price.unit_amount || 0,
        currency: subscription.items.data[0].price.currency,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        metadata: session.metadata
      };

      const { error: subscriptionError } = await supabaseService
        .from("subscriptions")
        .upsert(subscriptionData, { onConflict: "stripe_subscription_id" });

      if (subscriptionError) {
        logStep("Error creating/updating subscription", { error: subscriptionError });
        throw new Error(`Failed to update subscription: ${subscriptionError.message}`);
      }

      logStep("Subscription updated successfully");

      return new Response(JSON.stringify({ 
        success: true, 
        subscription_status: subscription.status,
        type: "subscription"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: "Payment not completed or invalid session"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
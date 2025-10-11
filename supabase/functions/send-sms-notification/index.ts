import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createRateLimit } from "../_shared/rateLimit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limit: 10 SMS per minute per user
const rateLimiter = createRateLimit(10, 60000);

interface SMSRequest {
  template: 'urgent_maintenance' | 'payment_overdue' | 'emergency_alert' | 'lease_expiration' | 'inspection_reminder' | 'custom';
  phoneNumbers: string[];
  data: {
    tenant_name?: string;
    property_address?: string;
    maintenance_description?: string;
    amount?: number;
    due_date?: string;
    emergency_type?: string;
    inspection_date?: string;
    custom_message?: string;
    [key: string]: any;
  };
}

const smsTemplates = {
  urgent_maintenance: (data: any) => 
    `🚨 URGENT: Maintenance issue at ${data.property_address}. ${data.maintenance_description}. Contact property management immediately.`,
  
  payment_overdue: (data: any) => 
    `PAYMENT OVERDUE: ${data.tenant_name}, your rent payment of $${data.amount} for ${data.property_address} was due ${data.due_date}. Please pay immediately to avoid late fees.`,
  
  emergency_alert: (data: any) => 
    `🚨 EMERGENCY: ${data.emergency_type} at ${data.property_address}. Please follow emergency procedures. Contact: [Emergency Number]`,
  
  lease_expiration: (data: any) => 
    `LEASE NOTICE: ${data.tenant_name}, your lease at ${data.property_address} expires in ${data.days_remaining} days. Contact us to discuss renewal options.`,
  
  inspection_reminder: (data: any) => 
    `INSPECTION REMINDER: Property inspection scheduled for ${data.inspection_date} at ${data.property_address}. Please ensure access is available.`,
  
  custom: (data: any) => data.custom_message || "Property management notification"
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Apply rate limiting
  const rateLimitResponse = rateLimiter(req);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Twilio credentials
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      throw new Error("Twilio credentials are not configured");
    }

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { template, phoneNumbers, data }: SMSRequest = await req.json();

    if (!smsTemplates[template]) {
      throw new Error(`Unknown SMS template: ${template}`);
    }

    const message = smsTemplates[template](data);
    const sentMessages = [];
    const failedMessages = [];

    console.log(`Sending ${template} SMS to:`, phoneNumbers);

    // Send SMS to each phone number
    for (const phoneNumber of phoneNumbers) {
      try {
        const smsResponse = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
          {
            method: "POST",
            headers: {
              "Authorization": `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              From: twilioPhoneNumber,
              To: phoneNumber,
              Body: message,
            }),
          }
        );

        if (smsResponse.ok) {
          const smsData = await smsResponse.json();
          sentMessages.push({
            phoneNumber,
            messageSid: smsData.sid,
            status: 'sent'
          });
          console.log(`SMS sent successfully to ${phoneNumber}:`, smsData.sid);
        } else {
          const errorData = await smsResponse.text();
          console.error(`SMS failed for ${phoneNumber}:`, errorData);
          failedMessages.push({
            phoneNumber,
            error: errorData,
            status: 'failed'
          });
        }
      } catch (error) {
        console.error(`SMS send error for ${phoneNumber}:`, error);
        failedMessages.push({
          phoneNumber,
          error: error.message,
          status: 'failed'
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      template,
      totalSent: sentMessages.length,
      totalFailed: failedMessages.length,
      sentMessages,
      failedMessages,
      message: message.substring(0, 100) + (message.length > 100 ? '...' : '')
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-sms-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.4';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  template: 'maintenance_request' | 'lease_reminder' | 'welcome_tenant' | 'payment_reminder' | 'maintenance_update' | 'property_inspection';
  to: string[];
  data: {
    tenant_name?: string;
    property_address?: string;
    maintenance_description?: string;
    due_date?: string;
    amount?: number;
    lease_end_date?: string;
    inspection_date?: string;
    status?: string;
    [key: string]: any;
  };
}

const emailTemplates = {
  maintenance_request: (data: any) => ({
    subject: `New Maintenance Request - ${data.property_address}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Maintenance Request</h2>
        <p>Dear Property Manager,</p>
        <p>A new maintenance request has been submitted for:</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Property:</strong> ${data.property_address}</p>
          <p><strong>Tenant:</strong> ${data.tenant_name}</p>
          <p><strong>Issue:</strong> ${data.maintenance_description}</p>
          <p><strong>Priority:</strong> ${data.priority || 'Medium'}</p>
        </div>
        <p>Please log into your dashboard to review and assign this request.</p>
        <a href="${data.dashboard_url || '#'}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Request</a>
      </div>
    `
  }),

  welcome_tenant: (data: any) => ({
    subject: `Welcome to ${data.property_address}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Welcome to Your New Home!</h2>
        <p>Dear ${data.tenant_name},</p>
        <p>Welcome to ${data.property_address}! We're excited to have you as our tenant.</p>
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Important Information:</h3>
          <p><strong>Move-in Date:</strong> ${data.move_in_date}</p>
          <p><strong>Monthly Rent:</strong> $${data.monthly_rent}</p>
          <p><strong>Property Manager:</strong> ${data.manager_name}</p>
          <p><strong>Emergency Contact:</strong> ${data.emergency_contact}</p>
        </div>
        <p>You can access your tenant portal to submit maintenance requests, view payment history, and more:</p>
        <a href="${data.portal_url || '#'}" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Access Tenant Portal</a>
      </div>
    `
  }),

  payment_reminder: (data: any) => ({
    subject: `Rent Payment Reminder - ${data.property_address}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Payment Reminder</h2>
        <p>Dear ${data.tenant_name},</p>
        <p>This is a friendly reminder that your rent payment is due.</p>
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Property:</strong> ${data.property_address}</p>
          <p><strong>Amount Due:</strong> $${data.amount}</p>
          <p><strong>Due Date:</strong> ${data.due_date}</p>
          <p><strong>Late Fee:</strong> $${data.late_fee || 0} (if paid after due date)</p>
        </div>
        <p>Please make your payment through your tenant portal or contact us if you have any questions.</p>
        <a href="${data.payment_url || '#'}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Make Payment</a>
      </div>
    `
  }),

  maintenance_update: (data: any) => ({
    subject: `Maintenance Update - ${data.property_address}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Maintenance Update</h2>
        <p>Dear ${data.tenant_name},</p>
        <p>We have an update on your maintenance request:</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Issue:</strong> ${data.maintenance_description}</p>
          <p><strong>Status:</strong> <span style="color: ${getStatusColor(data.status)}; font-weight: bold;">${data.status}</span></p>
          <p><strong>Scheduled Date:</strong> ${data.scheduled_date || 'TBD'}</p>
          ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
        </div>
        <p>Thank you for your patience. We'll keep you updated on any changes.</p>
      </div>
    `
  }),

  lease_reminder: (data: any) => ({
    subject: `Lease Renewal Reminder - ${data.property_address}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c2d12;">Lease Renewal Notice</h2>
        <p>Dear ${data.tenant_name},</p>
        <p>Your lease is approaching its end date. Please review the details below:</p>
        <div style="background: #fef7ed; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Property:</strong> ${data.property_address}</p>
          <p><strong>Current Lease End:</strong> ${data.lease_end_date}</p>
          <p><strong>Days Remaining:</strong> ${data.days_remaining}</p>
          <p><strong>New Monthly Rent:</strong> $${data.new_rent || data.current_rent}</p>
        </div>
        <p>Please contact us if you'd like to renew your lease or discuss your options.</p>
        <a href="${data.contact_url || '#'}" style="background: #7c2d12; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Contact Us</a>
      </div>
    `
  }),

  property_inspection: (data: any) => ({
    subject: `Property Inspection Scheduled - ${data.property_address}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Property Inspection Notice</h2>
        <p>Dear ${data.tenant_name},</p>
        <p>We have scheduled a property inspection as required by your lease agreement.</p>
        <div style="background: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Property:</strong> ${data.property_address}</p>
          <p><strong>Inspection Date:</strong> ${data.inspection_date}</p>
          <p><strong>Time:</strong> ${data.inspection_time}</p>
          <p><strong>Inspector:</strong> ${data.inspector_name}</p>
          <p><strong>Purpose:</strong> ${data.inspection_purpose || 'Routine inspection'}</p>
        </div>
        <p>Please ensure someone is available to provide access. Contact us if you need to reschedule.</p>
        <a href="${data.reschedule_url || '#'}" style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reschedule</a>
      </div>
    `
  })
};

function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'completed': return '#16a34a';
    case 'in-progress': return '#2563eb';
    case 'scheduled': return '#7c2d12';
    case 'cancelled': return '#dc2626';
    default: return '#6b7280';
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { template, to, data }: EmailRequest = await req.json();

    if (!emailTemplates[template]) {
      throw new Error(`Unknown email template: ${template}`);
    }

    const emailContent = emailTemplates[template](data);

    console.log(`Sending ${template} email to:`, to);

    const emailResponse = await resend.emails.send({
      from: `Property Management <noreply@${Deno.env.get('RESEND_DOMAIN') || 'resend.dev'}>`,
      to: to,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id,
      template,
      recipients: to.length 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-property-email function:", error);
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
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'property_manager' | 'owner_investor' | 'tenant' | 'house_watcher' | 'contractor' | 'client' | 'leasing_agent';
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  companyName?: string;
  additionalData?: Record<string, any>;
}

const generateTemporaryPassword = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName, role, phone, address, city, state, zipCode, companyName, additionalData }: CreateUserRequest = await req.json();

    console.log('Creating user with data:', { email, firstName, lastName, role });

    // Validate required fields
    if (!email || !firstName || !lastName || !role) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email, firstName, lastName, role" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

    // Generate temporary password
    const tempPassword = generateTemporaryPassword();

    // Create user account
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        role: role,
        temp_password: true
      }
    });

    if (userError) {
      console.error("Error creating user:", userError);
      return new Response(
        JSON.stringify({ error: "Failed to create user account", details: userError.message }),
        { 
          status: 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

    if (!userData.user) {
      return new Response(
        JSON.stringify({ error: "User creation failed - no user returned" }),
        { 
          status: 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

    const userId = userData.user.id;
    console.log(`User created successfully: ${userId}`);

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zip_code: zipCode || null,
        company_name: companyName || null,
      });

    if (profileError) {
      console.error("Error creating profile:", profileError);
      // Don't fail the entire request for profile errors
    }

    // Assign role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: role,
        assigned_by: null, // Will be set by RLS if admin is making the request
      });

    if (roleError) {
      console.error("Error assigning role:", roleError);
      return new Response(
        JSON.stringify({ error: "Failed to assign user role", details: roleError.message }),
        { 
          status: 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

    // Create role-specific records
    if (role === 'owner_investor') {
      const { error: ownerError } = await supabase
        .from('property_owners')
        .insert({
          user_id: userId,
          user_account_id: userId,
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: phone || '',
          address: address || null,
          city: city || null,
          state: state || null,
          zip_code: zipCode || null,
          company_name: companyName || null,
          is_self: false,
          preferred_payment_method: 'check',
          ...additionalData
        });

      if (ownerError) {
        console.error("Error creating property owner record:", ownerError);
      }
    } else if (role === 'house_watcher') {
      const { error: watcherError } = await supabase
        .from('house_watchers')
        .insert({
          user_id: userId,
          assigned_by: null, // Will be set by RLS if admin is making the request
        });

      if (watcherError) {
        console.error("Error creating house watcher record:", watcherError);
      }
    } else if (role === 'tenant') {
      // Tenant record creation will be handled separately when assigning to property
      console.log("Tenant user created - property assignment will be handled separately");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: userId,
        tempPassword: tempPassword,
        message: "User created successfully. Temporary password generated."
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in create-user-with-role function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
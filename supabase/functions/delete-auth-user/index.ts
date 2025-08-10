// Supabase Edge Function: delete-auth-user
// Deletes a Supabase auth user by user_id. Only admins can perform this.
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

serve(async (req) => {
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Missing Supabase env" }), { status: 500 });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });

    // Identify caller from JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), { status: 401 });
    }

    const supabaseAnon = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY") || "", {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false }
    });

    const { data: userData, error: userErr } = await supabaseAnon.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const callerId = userData.user.id;

    // Verify caller is admin using security definer RPC
    const { data: isAdmin, error: roleErr } = await supabaseAdmin.rpc("has_role", {
      _user_id: callerId,
      _role: "admin",
    });

    if (roleErr) {
      return new Response(JSON.stringify({ error: roleErr.message }), { status: 500 });
    }
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }

    const { user_id } = await req.json().catch(() => ({ user_id: undefined }));
    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id is required" }), { status: 400 });
    }

    const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(user_id);
    if (delErr) {
      return new Response(JSON.stringify({ success: false, error: delErr.message }), { status: 400 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});

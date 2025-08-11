import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the current user to verify admin access
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if the current user is an admin
    const { data: hasAdminRole, error: roleError } = await supabaseAdmin
      .rpc('has_role', { _user_id: user.id, _role: 'admin' })

    if (roleError || !hasAdminRole) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { userId, newPassword, resetType } = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let result;
    
    if (resetType === 'reset_link') {
      // Send password reset email
      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: userId, // This should be the user's email
      })

      if (error) {
        console.error('Error generating reset link:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      result = { 
        message: 'Password reset link sent successfully',
        resetUrl: data.properties?.action_link 
      }
    } else if (resetType === 'set_password' && newPassword) {
      // First, find the user by email to get their ID
      const { data: authUsers, error: getUserError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (getUserError) {
        console.error('Error listing users:', getUserError)
        return new Response(
          JSON.stringify({ error: 'Failed to find user' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const targetUser = authUsers.users.find(u => u.email === userId)
      
      if (!targetUser) {
        console.error('User not found with email:', userId)
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Directly set new password using the actual user ID
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
        targetUser.id,
        { password: newPassword }
      )

      if (error) {
        console.error('Error setting password:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      result = { 
        message: 'Password updated successfully',
        user: data.user 
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid reset type or missing password' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
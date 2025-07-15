-- Fix security definer views and function search path issues

-- Drop and recreate user_profiles view without security definer
DROP VIEW IF EXISTS public.user_profiles CASCADE;

-- Recreate user_profiles view without security definer property
CREATE OR REPLACE VIEW public.user_profiles AS
SELECT 
    u.id,
    u.email,
    u.created_at as user_created_at,
    u.updated_at as user_updated_at,
    u.email_confirmed_at,
    u.last_sign_in_at,
    p.first_name,
    p.last_name,
    p.company_name,
    p.phone,
    p.address,
    p.city,
    p.state,
    p.zip_code,
    ur.role,
    ur.assigned_by,
    ur.assigned_at,
    ur.created_at as role_created_at,
    ur.updated_at as role_updated_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id;

-- Grant permissions on the view
GRANT SELECT ON public.user_profiles TO authenticated;

-- Fix function search paths for security
ALTER FUNCTION public.has_role(_user_id uuid, _role app_role) 
SET search_path = public, pg_temp;

ALTER FUNCTION public.get_user_roles(_user_id uuid) 
SET search_path = public, pg_temp;

ALTER FUNCTION public.update_updated_at_column() 
SET search_path = public, pg_temp;

ALTER FUNCTION public.handle_new_user() 
SET search_path = public, pg_temp;

-- Fix any other functions that might have mutable search paths
ALTER FUNCTION public.track_maintenance_status_change() 
SET search_path = public, pg_temp;

ALTER FUNCTION public.update_conversation_last_message()
SET search_path = public, pg_temp;

ALTER FUNCTION public.create_message_deliveries()
SET search_path = public, pg_temp;

-- Add comment for security compliance
COMMENT ON VIEW public.user_profiles IS 'User profiles view without security definer for better security compliance';
COMMENT ON FUNCTION public.has_role(uuid, app_role) IS 'Role checking function with secure search path';
COMMENT ON FUNCTION public.get_user_roles(uuid) IS 'User roles function with secure search path';
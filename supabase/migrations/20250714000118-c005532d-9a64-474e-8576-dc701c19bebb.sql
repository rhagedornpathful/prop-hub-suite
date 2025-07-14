-- Fix security issues with views

-- 1. Drop and recreate user_profiles view without SECURITY DEFINER and without exposing auth.users to anon
DROP VIEW IF EXISTS public.user_profiles;

CREATE VIEW public.user_profiles AS
SELECT 
  p.id,
  p.user_id,
  p.first_name,
  p.last_name,
  p.phone,
  p.company_name,
  p.address,
  p.city,
  p.state,
  p.zip_code,
  p.created_at as user_created_at,
  p.updated_at as user_updated_at,
  ur.role,
  ur.assigned_by,
  ur.assigned_at,
  ur.created_at as role_created_at,
  ur.updated_at as role_updated_at
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id;

-- 2. Drop and recreate maintenance_calendar_events view without SECURITY DEFINER
DROP VIEW IF EXISTS public.maintenance_calendar_events;

CREATE VIEW public.maintenance_calendar_events AS
SELECT 
  mr.id,
  mr.title,
  mr.description,
  mr.priority,
  mr.status,
  mr.scheduled_date as start_date,
  mr.due_date as end_date,
  mr.assigned_to,
  mr.property_id,
  p.address as property_address,
  up.first_name || ' ' || up.last_name as assigned_to_name
FROM public.maintenance_requests mr
LEFT JOIN public.properties p ON mr.property_id = p.id
LEFT JOIN public.user_profiles up ON mr.assigned_to = up.user_id
WHERE mr.scheduled_date IS NOT NULL OR mr.due_date IS NOT NULL;

-- 3. Add proper RLS policies for user_profiles view
ALTER VIEW public.user_profiles SET (security_invoker = on);

-- Enable RLS on the view (if supported) or rely on underlying table policies
-- The view will inherit RLS policies from the underlying tables (profiles and user_roles)

-- 4. Add proper RLS policies for maintenance_calendar_events view  
ALTER VIEW public.maintenance_calendar_events SET (security_invoker = on);

-- 5. Ensure proper RLS policies exist for profiles table access
-- Users can view their own profile
CREATE POLICY IF NOT EXISTS "Users can view their own profile in view" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Admins can view all profiles  
CREATE POLICY IF NOT EXISTS "Admins can view all profiles in view"
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Property managers can view all profiles
CREATE POLICY IF NOT EXISTS "Property managers can view all profiles in view"
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'property_manager'::app_role));
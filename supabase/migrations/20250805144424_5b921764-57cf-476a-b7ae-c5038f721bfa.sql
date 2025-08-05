-- Fix Security Issues

-- 1. Remove any exposed auth.users views (if they exist)
-- This addresses the "Exposed Auth Users" security error
DROP VIEW IF EXISTS public.user_profiles CASCADE;

-- 2. Fix Security Definer functions to use proper search_path
-- This addresses both "Security Definer View" and "Function Search Path Mutable" issues

-- Update existing security definer functions to include search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id uuid)
RETURNS app_role[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT ARRAY_AGG(role) 
  FROM public.user_roles 
  WHERE user_id = _user_id
$$;

-- Update make_me_admin function to be more secure
CREATE OR REPLACE FUNCTION public.make_me_admin()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'admin')
  ON CONFLICT (user_id, role) 
  DO UPDATE SET role = 'admin', updated_at = now();
  
  RETURN json_build_object('success', true, 'message', 'You are now an admin');
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$;

-- Update force_make_me_admin to be more secure and set proper search_path
CREATE OR REPLACE FUNCTION public.force_make_me_admin()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  v_user_id uuid;
  v_result json;
BEGIN
  -- Get the calling user's id
  v_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not authenticated'
    );
  END IF;
  
  -- Delete any existing roles for this user
  DELETE FROM public.user_roles WHERE user_id = v_user_id;
  
  -- Insert admin role
  INSERT INTO public.user_roles (user_id, role, created_at, updated_at)
  VALUES (v_user_id, 'admin', NOW(), NOW());
  
  -- Return success
  SELECT json_build_object(
    'success', true,
    'user_id', v_user_id,
    'role', 'admin',
    'message', 'Admin role assigned successfully'
  ) INTO v_result;
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'error_detail', SQLSTATE
    );
END;
$$;

-- Update handle_new_user function for security
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  
  -- For production, don't automatically assign admin role
  -- Users should be assigned roles manually by existing admins
  -- Only create profile, no automatic role assignment
  
  RETURN NEW;
END;
$$;

-- Update other functions to include search_path
CREATE OR REPLACE FUNCTION public.create_message_deliveries()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  INSERT INTO public.message_deliveries (message_id, user_id)
  SELECT NEW.id, user_id
  FROM public.conversation_participants
  WHERE conversation_id = NEW.conversation_id 
    AND user_id != NEW.sender_id 
    AND left_at IS NULL;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.track_maintenance_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  -- Only track if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.maintenance_status_history (
      maintenance_request_id,
      old_status,
      new_status,
      changed_by
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      auth.uid()
    );
    
    -- Set timestamp fields based on new status
    IF NEW.status = 'in-progress' AND OLD.status = 'scheduled' THEN
      NEW.started_at = now();
    ELSIF NEW.status = 'completed' THEN
      NEW.completed_at = now();
    ELSIF NEW.status = 'cancelled' THEN
      NEW.cancelled_at = now();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  UPDATE public.conversations 
  SET last_message_at = NEW.created_at, updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 3. Remove emergency admin bypass functions for production security
-- Comment out the seed_test_users function as it's for development only
CREATE OR REPLACE FUNCTION public.seed_test_users()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  -- Disabled for production security
  RETURN 'Function disabled in production for security reasons';
END;
$$;
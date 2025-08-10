-- Fix all security issues identified by the linter

-- 1. Fix functions with mutable search_path (there seem to be 2 functions missing search_path)
-- Let me check and fix the seed_test_users and track_maintenance_status_change functions

-- Fix seed_test_users function
CREATE OR REPLACE FUNCTION public.seed_test_users()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Disabled for production security
  RETURN 'Function disabled in production for security reasons';
END;
$function$;

-- Fix track_maintenance_status_change function  
CREATE OR REPLACE FUNCTION public.track_maintenance_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
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
$function$;
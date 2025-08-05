-- Fix remaining function search path issue
CREATE OR REPLACE FUNCTION public.check_role_conflicts()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  -- Prevent admin + house_watcher combination
  IF NEW.role = 'admin' AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = NEW.user_id AND role = 'house_watcher'
  ) THEN
    RAISE EXCEPTION 'User cannot have both admin and house_watcher roles';
  END IF;
  
  IF NEW.role = 'house_watcher' AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = NEW.user_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'User cannot have both admin and house_watcher roles';
  END IF;
  
  RETURN NEW;
END;
$$;
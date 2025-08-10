-- Update messaging restrictions to ensure property managers can only message tenants on assigned properties

-- Drop existing function and trigger first
DROP TRIGGER IF EXISTS validate_conversation_participants_trigger ON conversation_participants;
DROP FUNCTION IF EXISTS public.validate_conversation_participants();

-- Create updated function to validate conversation participants with property restrictions
CREATE OR REPLACE FUNCTION public.validate_conversation_participants()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  creator_role app_role;
  participant_role app_role;
  creator_user_id uuid;
  participant_user_id uuid;
BEGIN
  -- Get the conversation creator's role
  SELECT created_by INTO creator_user_id FROM conversations WHERE id = NEW.conversation_id;
  SELECT role INTO creator_role FROM user_roles WHERE user_id = creator_user_id LIMIT 1;
  
  -- Get the participant's role  
  participant_user_id := NEW.user_id;
  SELECT role INTO participant_role FROM user_roles WHERE user_id = participant_user_id LIMIT 1;
  
  -- House watchers can only message admins
  IF creator_role = 'house_watcher' AND participant_role != 'admin' THEN
    RAISE EXCEPTION 'House watchers can only message administrators';
  END IF;
  
  -- Property managers can only message admins and tenants on their assigned properties
  IF creator_role = 'property_manager' AND participant_role = 'tenant' THEN
    -- Check if the tenant is on a property assigned to this property manager
    IF NOT EXISTS (
      SELECT 1 FROM tenants t
      JOIN property_manager_assignments pma ON pma.property_id = t.property_id
      WHERE t.user_account_id = participant_user_id 
      AND pma.user_id = creator_user_id
    ) THEN
      RAISE EXCEPTION 'Property managers can only message tenants on their assigned properties';
    END IF;
  ELSIF creator_role = 'property_manager' AND participant_role NOT IN ('admin', 'tenant') THEN
    RAISE EXCEPTION 'Property managers can only message administrators and tenants';
  END IF;
  
  -- If participant is house watcher, only admins can message them
  IF participant_role = 'house_watcher' AND creator_role != 'admin' THEN
    RAISE EXCEPTION 'Only administrators can message house watchers';
  END IF;
  
  -- If participant is property manager, only admins and tenants can message them
  IF participant_role = 'property_manager' AND creator_role NOT IN ('admin', 'tenant') THEN
    RAISE EXCEPTION 'Only administrators and tenants can message property managers';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to validate participants when they're added to conversations
CREATE TRIGGER validate_conversation_participants_trigger
  BEFORE INSERT ON conversation_participants
  FOR EACH ROW
  EXECUTE FUNCTION validate_conversation_participants();
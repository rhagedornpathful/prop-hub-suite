-- Update the conversation participant validation function to match the new messaging rules
CREATE OR REPLACE FUNCTION public.validate_conversation_participants()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
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
  
  -- Admins can message anyone - no restrictions
  IF creator_role = 'admin' THEN
    RETURN NEW;
  END IF;
  
  -- Anyone can receive messages from admins - no restrictions on admin as participant
  IF participant_role = 'admin' THEN
    RETURN NEW;
  END IF;
  
  -- House watchers can only message admins
  IF creator_role = 'house_watcher' AND participant_role != 'admin' THEN
    RAISE EXCEPTION 'House watchers can only message administrators';
  END IF;
  
  -- Property owners can only message admins
  IF creator_role = 'owner_investor' AND participant_role != 'admin' THEN
    RAISE EXCEPTION 'Property owners can only message administrators';
  END IF;
  
  -- Vendors/contractors can only message admins
  IF creator_role = 'contractor' AND participant_role != 'admin' THEN
    RAISE EXCEPTION 'Vendors can only message administrators';
  END IF;
  
  -- Property managers can message admins and tenants
  IF creator_role = 'property_manager' THEN
    IF participant_role = 'tenant' THEN
      -- Check if the tenant is on a property assigned to this property manager
      IF NOT EXISTS (
        SELECT 1 FROM tenants t
        JOIN property_manager_assignments pma ON pma.property_id = t.property_id
        WHERE t.user_account_id = participant_user_id 
        AND pma.manager_user_id = creator_user_id
      ) THEN
        RAISE EXCEPTION 'Property managers can only message tenants on their assigned properties';
      END IF;
    ELSIF participant_role != 'admin' THEN
      RAISE EXCEPTION 'Property managers can only message administrators and tenants on their assigned properties';
    END IF;
  END IF;
  
  -- Tenants can message property managers and admins
  IF creator_role = 'tenant' THEN
    IF participant_role = 'property_manager' THEN
      -- Check if the property manager is assigned to this tenant's property
      IF NOT EXISTS (
        SELECT 1 FROM tenants t
        JOIN property_manager_assignments pma ON pma.property_id = t.property_id
        WHERE t.user_account_id = creator_user_id 
        AND pma.manager_user_id = participant_user_id
      ) THEN
        RAISE EXCEPTION 'Tenants can only message property managers assigned to their property';
      END IF;
    ELSIF participant_role NOT IN ('admin', 'property_manager') THEN
      RAISE EXCEPTION 'Tenants can only message administrators and their assigned property managers';
    END IF;
  END IF;
  
  -- Restrict who can receive messages from other roles
  -- House watchers can only receive messages from admins
  IF participant_role = 'house_watcher' AND creator_role != 'admin' THEN
    RAISE EXCEPTION 'Only administrators can message house watchers';
  END IF;
  
  -- Property owners can only receive messages from admins
  IF participant_role = 'owner_investor' AND creator_role != 'admin' THEN
    RAISE EXCEPTION 'Only administrators can message property owners';
  END IF;
  
  -- Vendors can only receive messages from admins
  IF participant_role = 'contractor' AND creator_role != 'admin' THEN
    RAISE EXCEPTION 'Only administrators can message vendors';
  END IF;
  
  -- Property managers can receive messages from admins and their assigned tenants
  IF participant_role = 'property_manager' AND creator_role NOT IN ('admin', 'tenant') THEN
    RAISE EXCEPTION 'Only administrators and tenants can message property managers';
  END IF;
  
  RETURN NEW;
END;
$function$;
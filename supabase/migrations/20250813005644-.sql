-- Fix validate_conversation_participants to use correct column names
CREATE OR REPLACE FUNCTION public.validate_conversation_participants(
  conversation_id_param uuid,
  sender_id_param uuid,
  recipient_ids_param uuid[]
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  sender_role TEXT;
  recipient_role TEXT;
  recipient_id UUID;
  conversation_exists BOOLEAN;
  sender_is_participant BOOLEAN;
BEGIN
  -- Check if conversation already exists
  SELECT EXISTS(SELECT 1 FROM public.conversations WHERE id = conversation_id_param) 
  INTO conversation_exists;
  
  -- If conversation exists, check if sender is a participant (allow replies)
  IF conversation_exists THEN
    SELECT EXISTS(
      SELECT 1 FROM public.conversation_participants 
      WHERE conversation_id = conversation_id_param AND user_id = sender_id_param
    ) INTO sender_is_participant;
    
    -- If sender is already a participant, allow the message (reply scenario)
    IF sender_is_participant THEN
      RETURN TRUE;
    END IF;
  END IF;
  
  -- For new conversations, apply role-based restrictions
  -- Get sender's role
  SELECT ur.role INTO sender_role
  FROM public.user_roles ur
  WHERE ur.user_id = sender_id_param
  LIMIT 1;
  
  -- If sender is admin, allow messaging anyone
  IF sender_role = 'admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Check each recipient based on sender's role
  FOREACH recipient_id IN ARRAY recipient_ids_param LOOP
    -- Get recipient's role
    SELECT ur.role INTO recipient_role
    FROM public.user_roles ur
    WHERE ur.user_id = recipient_id
    LIMIT 1;
    
    -- Apply role-based messaging rules for new conversations
    CASE sender_role
      WHEN 'house_watcher' THEN
        -- House watchers can only message admins
        IF recipient_role != 'admin' THEN
          RETURN FALSE;
        END IF;
      
      WHEN 'owner_investor' THEN
        -- Property owners can only message admins
        IF recipient_role != 'admin' THEN
          RETURN FALSE;
        END IF;
      
      WHEN 'contractor' THEN
        -- Vendors can only message admins
        IF recipient_role != 'admin' THEN
          RETURN FALSE;
        END IF;
      
      WHEN 'property_manager' THEN
        -- Property managers can message admins and tenants (on their properties)
        IF recipient_role NOT IN ('admin', 'tenant') THEN
          RETURN FALSE;
        END IF;
        
        -- If messaging a tenant, verify they manage a property where the tenant lives
        IF recipient_role = 'tenant' THEN
          IF NOT EXISTS (
            SELECT 1 
            FROM public.property_manager_assignments pma
            JOIN public.tenants t ON t.property_id = pma.property_id
            WHERE pma.manager_user_id = sender_id_param 
              AND t.user_account_id = recipient_id
          ) THEN
            RETURN FALSE;
          END IF;
        END IF;
      
      WHEN 'tenant' THEN
        -- Tenants can message admins and their assigned property managers
        IF recipient_role = 'admin' THEN
          -- Always allow messaging admins
          CONTINUE;
        ELSIF recipient_role = 'property_manager' THEN
          -- Verify this property manager manages their property
          IF NOT EXISTS (
            SELECT 1 
            FROM public.tenants t
            JOIN public.property_manager_assignments pma ON pma.property_id = t.property_id
            WHERE t.user_account_id = sender_id_param 
              AND pma.manager_user_id = recipient_id
          ) THEN
            RETURN FALSE;
          END IF;
        ELSE
          RETURN FALSE;
        END IF;
      
      ELSE
        -- Unknown role, deny
        RETURN FALSE;
    END CASE;
  END LOOP;
  
  RETURN TRUE;
END;
$function$;
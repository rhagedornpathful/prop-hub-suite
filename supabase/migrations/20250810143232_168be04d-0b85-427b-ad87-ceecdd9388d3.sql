-- Remove duplicate triggers that are causing the constraint violation
DROP TRIGGER IF EXISTS create_message_deliveries_trigger ON public.messages;
DROP TRIGGER IF EXISTS update_conversation_last_message_trigger ON public.messages;

-- Keep only the properly named triggers
-- trg_create_message_deliveries and trg_update_conversation_last_message should remain

-- Also, let's make the trigger more robust to handle potential duplicates
CREATE OR REPLACE FUNCTION public.create_message_deliveries()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $function$
BEGIN
  -- Only create deliveries for non-draft messages
  IF NEW.is_draft = false THEN
    INSERT INTO public.message_deliveries (message_id, user_id)
    SELECT NEW.id, user_id
    FROM public.conversation_participants
    WHERE conversation_id = NEW.conversation_id 
      AND user_id != NEW.sender_id 
      AND left_at IS NULL
    -- Use ON CONFLICT to prevent duplicate key violations
    ON CONFLICT (message_id, user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Verify the remaining triggers
SELECT tgname, tgfoid::regproc 
FROM pg_trigger 
WHERE tgrelid = 'messages'::regclass 
AND tgname LIKE '%create_message%' OR tgname LIKE '%update_conversation%';
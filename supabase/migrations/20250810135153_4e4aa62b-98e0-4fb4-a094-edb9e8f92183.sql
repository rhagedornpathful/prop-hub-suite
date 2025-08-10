-- Create triggers to keep conversations updated and deliveries created on new messages
DO $$ BEGIN
  -- Update conversation last_message_at on message insert
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_conversation_last_message'
  ) THEN
    CREATE TRIGGER trg_update_conversation_last_message
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_conversation_last_message();
  END IF;

  -- Create message deliveries for participants on message insert
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_create_message_deliveries'
  ) THEN
    CREATE TRIGGER trg_create_message_deliveries
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.create_message_deliveries();
  END IF;
END $$;
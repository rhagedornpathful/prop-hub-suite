-- Phase 1-3: Enterprise Messaging System Database Enhancements

-- Enable full-text search extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- Message search indexes for performance
CREATE INDEX IF NOT EXISTS messages_search_idx ON public.messages USING GIN (to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS messages_conversation_created_idx ON public.messages (conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS conversations_search_idx ON public.conversations USING GIN (to_tsvector('english', title));

-- Message reactions table
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'laugh', 'wow', 'sad', 'angry', 'thumbs_up', 'thumbs_down')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(message_id, user_id, reaction_type)
);

-- Enable RLS on message reactions
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- Message reactions policies
CREATE POLICY "Users can view reactions on accessible messages" ON public.message_reactions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.messages m 
    JOIN public.conversation_participants cp ON cp.conversation_id = m.conversation_id
    WHERE m.id = message_reactions.message_id AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their own reactions" ON public.message_reactions
FOR ALL USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Message mentions table
CREATE TABLE IF NOT EXISTS public.message_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(message_id, mentioned_user_id)
);

-- Enable RLS on message mentions
ALTER TABLE public.message_mentions ENABLE ROW LEVEL SECURITY;

-- Message mentions policies
CREATE POLICY "Users can view their own mentions" ON public.message_mentions
FOR SELECT USING (mentioned_user_id = auth.uid());

CREATE POLICY "Message senders can create mentions" ON public.message_mentions
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.messages m 
    WHERE m.id = message_mentions.message_id AND m.sender_id = auth.uid()
  )
);

-- Notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  mention_notifications BOOLEAN DEFAULT true,
  message_notifications BOOLEAN DEFAULT true,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on notification preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Notification preferences policies
CREATE POLICY "Users can manage their own notification preferences" ON public.notification_preferences
FOR ALL USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Message templates table
CREATE TABLE IF NOT EXISTS public.message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_shared BOOLEAN DEFAULT false,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on message templates
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

-- Message templates policies
CREATE POLICY "Users can manage their own templates" ON public.message_templates
FOR ALL USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view shared templates" ON public.message_templates
FOR SELECT USING (is_shared = true OR user_id = auth.uid());

-- Message analytics table
CREATE TABLE IF NOT EXISTS public.message_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('sent', 'delivered', 'read', 'reaction_added', 'mention_created')),
  user_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on message analytics
ALTER TABLE public.message_analytics ENABLE ROW LEVEL SECURITY;

-- Message analytics policies
CREATE POLICY "Admins can view all analytics" ON public.message_analytics
FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Property managers can view analytics" ON public.message_analytics
FOR SELECT USING (has_role(auth.uid(), 'property_manager'));

-- Audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  user_id UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Audit logs policies
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Message retention policies table
CREATE TABLE IF NOT EXISTS public.message_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_type TEXT NOT NULL,
  retention_days INTEGER NOT NULL CHECK (retention_days > 0),
  auto_delete_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on retention policies
ALTER TABLE public.message_retention_policies ENABLE ROW LEVEL SECURITY;

-- Retention policies policies
CREATE POLICY "Admins can manage retention policies" ON public.message_retention_policies
FOR ALL USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Message encryption keys table (for E2E encryption)
CREATE TABLE IF NOT EXISTS public.message_encryption_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  public_key TEXT NOT NULL,
  key_fingerprint TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on encryption keys
ALTER TABLE public.message_encryption_keys ENABLE ROW LEVEL SECURITY;

-- Encryption keys policies
CREATE POLICY "Users can manage their own keys" ON public.message_encryption_keys
FOR ALL USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view all active public keys" ON public.message_encryption_keys
FOR SELECT USING (is_active = true);

-- Add new columns to existing tables for enhanced functionality
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS encrypted_content TEXT,
ADD COLUMN IF NOT EXISTS encryption_key_id UUID REFERENCES public.message_encryption_keys(id),
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS thread_id UUID,
ADD COLUMN IF NOT EXISTS forwarded_from_id UUID REFERENCES public.messages(id);

ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS auto_delete_after_days INTEGER,
ADD COLUMN IF NOT EXISTS retention_policy_id UUID REFERENCES public.message_retention_policies(id),
ADD COLUMN IF NOT EXISTS encryption_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS muted_until TIMESTAMP WITH TIME ZONE;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS message_reactions_message_idx ON public.message_reactions (message_id);
CREATE INDEX IF NOT EXISTS message_mentions_user_idx ON public.message_mentions (mentioned_user_id, read_at);
CREATE INDEX IF NOT EXISTS message_analytics_conversation_idx ON public.message_analytics (conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_table_record_idx ON public.audit_logs (table_name, record_id);
CREATE INDEX IF NOT EXISTS messages_scheduled_idx ON public.messages (scheduled_at) WHERE scheduled_at IS NOT NULL;

-- Functions for message analytics
CREATE OR REPLACE FUNCTION public.log_message_analytics(
  conv_id UUID,
  msg_id UUID,
  event_type TEXT,
  user_id UUID DEFAULT NULL,
  metadata JSONB DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  INSERT INTO public.message_analytics (conversation_id, message_id, event_type, user_id, metadata)
  VALUES (conv_id, msg_id, event_type, user_id, metadata);
END;
$$;

-- Function to process @mentions in messages
CREATE OR REPLACE FUNCTION public.process_message_mentions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  mention_regex TEXT := '@([a-zA-Z0-9._-]+)';
  mentioned_usernames TEXT[];
  username TEXT;
  mentioned_user_id UUID;
BEGIN
  -- Extract mentions from message content
  SELECT array_agg(matches[1])
  INTO mentioned_usernames
  FROM regexp_split_to_table(NEW.content, mention_regex, 'g') AS matches;
  
  IF mentioned_usernames IS NOT NULL THEN
    FOREACH username IN ARRAY mentioned_usernames LOOP
      -- Find user by username (assuming profiles table has username)
      SELECT user_id INTO mentioned_user_id
      FROM public.profiles
      WHERE username = username
      LIMIT 1;
      
      IF mentioned_user_id IS NOT NULL THEN
        -- Insert mention record
        INSERT INTO public.message_mentions (message_id, mentioned_user_id)
        VALUES (NEW.id, mentioned_user_id)
        ON CONFLICT (message_id, mentioned_user_id) DO NOTHING;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for processing mentions
DROP TRIGGER IF EXISTS process_mentions_trigger ON public.messages;
CREATE TRIGGER process_mentions_trigger
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.process_message_mentions();

-- Function for message search with ranking
CREATE OR REPLACE FUNCTION public.search_messages(
  search_query TEXT,
  user_id_param UUID,
  conversation_id_param UUID DEFAULT NULL,
  limit_param INTEGER DEFAULT 50,
  offset_param INTEGER DEFAULT 0
)
RETURNS TABLE (
  message_id UUID,
  conversation_id UUID,
  content TEXT,
  sender_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  rank REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.conversation_id,
    m.content,
    m.sender_id,
    m.created_at,
    ts_rank(to_tsvector('english', m.content), plainto_tsquery('english', search_query)) as rank
  FROM public.messages m
  JOIN public.conversation_participants cp ON cp.conversation_id = m.conversation_id
  WHERE 
    cp.user_id = user_id_param
    AND cp.left_at IS NULL
    AND (conversation_id_param IS NULL OR m.conversation_id = conversation_id_param)
    AND to_tsvector('english', m.content) @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC, m.created_at DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$;

-- Add username column to profiles if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Create index on username
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles (username) WHERE username IS NOT NULL;
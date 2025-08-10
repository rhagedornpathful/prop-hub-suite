-- Fix conversations table RLS policies
-- The conversations table currently has no RLS policies, which is a critical security issue

-- Enable RLS on conversations table (should already be enabled, but ensuring it)
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Create policies for conversations table
CREATE POLICY "Users can view conversations they participate in"
ON public.conversations
FOR SELECT
USING (
  id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = auth.uid() 
    AND left_at IS NULL
  )
);

CREATE POLICY "Authenticated users can create conversations"
ON public.conversations
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Conversation creators and admins can update conversations"
ON public.conversations
FOR UPDATE
USING (
  auth.uid() = created_by OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'property_manager'::app_role)
);

-- Admin and property manager policies for better management
CREATE POLICY "Admins can manage all conversations"
ON public.conversations
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can manage all conversations"
ON public.conversations
FOR ALL
USING (has_role(auth.uid(), 'property_manager'::app_role));

-- Create inbox-specific fields for Gmail-like functionality
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal' CHECK (priority IN ('high', 'normal', 'low')),
ADD COLUMN IF NOT EXISTS labels TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS thread_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS sender_name TEXT,
ADD COLUMN IF NOT EXISTS recipient_names TEXT[];

-- Create message threading and organization features
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS importance TEXT DEFAULT 'normal' CHECK (importance IN ('high', 'normal', 'low')),
ADD COLUMN IF NOT EXISTS subject TEXT,
ADD COLUMN IF NOT EXISTS cc_recipients TEXT[],
ADD COLUMN IF NOT EXISTS bcc_recipients TEXT[];

-- Create user inbox settings table
CREATE TABLE IF NOT EXISTS public.user_inbox_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  auto_archive_days INTEGER DEFAULT 30,
  signature TEXT,
  auto_respond_enabled BOOLEAN DEFAULT FALSE,
  auto_respond_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_inbox_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own inbox settings"
ON public.user_inbox_settings
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create conversation labels table for Gmail-like labeling
CREATE TABLE IF NOT EXISTS public.conversation_labels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  color TEXT DEFAULT '#000000',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, conversation_id, label)
);

ALTER TABLE public.conversation_labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own conversation labels"
ON public.conversation_labels
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_user_inbox_settings_updated_at
BEFORE UPDATE ON public.user_inbox_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_priority ON public.conversations(priority);
CREATE INDEX IF NOT EXISTS idx_conversations_labels ON public.conversations USING GIN(labels);
CREATE INDEX IF NOT EXISTS idx_conversations_archived ON public.conversations(is_archived);
CREATE INDEX IF NOT EXISTS idx_conversations_starred ON public.conversations(is_starred);
CREATE INDEX IF NOT EXISTS idx_messages_subject ON public.messages(subject);
CREATE INDEX IF NOT EXISTS idx_messages_importance ON public.messages(importance);
CREATE INDEX IF NOT EXISTS idx_conversation_labels_user_conversation ON public.conversation_labels(user_id, conversation_id);
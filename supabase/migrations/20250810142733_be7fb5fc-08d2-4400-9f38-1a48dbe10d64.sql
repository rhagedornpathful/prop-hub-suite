-- Fix infinite recursion in RLS policies by using security definer functions

-- First, drop the problematic policies
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.conversations;
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Conversation creators and admins can update conversations" ON public.conversations;
DROP POLICY IF EXISTS "Admins can manage all conversations" ON public.conversations;
DROP POLICY IF EXISTS "Property managers can manage all conversations" ON public.conversations;

-- Create security definer functions to avoid recursion
CREATE OR REPLACE FUNCTION public.user_can_access_conversation(_conversation_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM conversation_participants
    WHERE conversation_id = _conversation_id
    AND user_id = _user_id
    AND left_at IS NULL
  );
$$;

CREATE OR REPLACE FUNCTION public.user_created_conversation(_conversation_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM conversations
    WHERE id = _conversation_id
    AND created_by = _user_id
  );
$$;

-- Create new safe policies using the security definer functions
CREATE POLICY "Users can view conversations they participate in"
ON public.conversations
FOR SELECT
USING (
  public.user_can_access_conversation(id, auth.uid()) OR
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'property_manager'::app_role)
);

CREATE POLICY "Authenticated users can create conversations"
ON public.conversations
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Conversation creators and managers can update conversations"
ON public.conversations
FOR UPDATE
USING (
  public.user_created_conversation(id, auth.uid()) OR
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'property_manager'::app_role)
);

CREATE POLICY "Admins and managers can delete conversations"
ON public.conversations
FOR DELETE
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'property_manager'::app_role)
);

-- Also fix any potential recursion in conversation_participants policies
-- Drop and recreate them safely
DROP POLICY IF EXISTS "Users can view their own participant row" ON public.conversation_participants;
DROP POLICY IF EXISTS "Admins and property managers can manage participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "Creators can manage participants for their conversations" ON public.conversation_participants;

CREATE POLICY "Users can view participants in their conversations"
ON public.conversation_participants
FOR SELECT
USING (
  user_id = auth.uid() OR
  public.user_can_access_conversation(conversation_id, auth.uid()) OR
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'property_manager'::app_role)
);

CREATE POLICY "Conversation creators and managers can manage participants"
ON public.conversation_participants
FOR ALL
USING (
  public.user_created_conversation(conversation_id, auth.uid()) OR
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'property_manager'::app_role)
)
WITH CHECK (
  public.user_created_conversation(conversation_id, auth.uid()) OR
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'property_manager'::app_role)
);
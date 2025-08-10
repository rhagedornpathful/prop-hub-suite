-- Fix infinite recursion in conversations RLS by using security definer functions
CREATE OR REPLACE FUNCTION public.can_manage_conversation(_conversation_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = _conversation_id 
    AND c.created_by = _user_id
  ) OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id 
    AND ur.role IN ('admin', 'property_manager')
  );
$$;

-- Drop existing policies that might cause recursion
DROP POLICY IF EXISTS "Conversation creators can update their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.conversations;
DROP POLICY IF EXISTS "Admins and property managers can create conversations" ON public.conversations;

-- Create new non-recursive policies
CREATE POLICY "Users can view conversations they participate in" 
ON public.conversations
FOR SELECT
USING (
  id IN (
    SELECT conversation_id 
    FROM public.conversation_participants 
    WHERE user_id = auth.uid() AND left_at IS NULL
  )
);

CREATE POLICY "Anyone can create conversations"
ON public.conversations
FOR INSERT
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Conversation creators and admins can update conversations"
ON public.conversations
FOR UPDATE
USING (public.can_manage_conversation(id, auth.uid()));
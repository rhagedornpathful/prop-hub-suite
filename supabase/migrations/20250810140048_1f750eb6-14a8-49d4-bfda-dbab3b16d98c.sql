-- Completely rebuild conversations RLS without any self-references
-- First, drop ALL existing policies on conversations
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.conversations;
DROP POLICY IF EXISTS "Anyone can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Conversation creators and admins can update conversations" ON public.conversations;
DROP POLICY IF EXISTS "Conversation creators can update their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Admins and property managers can create conversations" ON public.conversations;

-- Drop the problematic function
DROP FUNCTION IF EXISTS public.can_manage_conversation;

-- Create simple, non-recursive policies
CREATE POLICY "Participants can view conversations"
ON public.conversations
FOR SELECT
USING (
  id IN (
    SELECT conversation_id 
    FROM public.conversation_participants 
    WHERE user_id = auth.uid() AND left_at IS NULL
  )
);

CREATE POLICY "Authenticated users can create conversations"
ON public.conversations
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

CREATE POLICY "Admins and managers can update conversations"
ON public.conversations
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'property_manager'));
-- Fix RLS recursion on conversation_participants by simplifying SELECT policy
-- Drop the existing recursive policy
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON public.conversation_participants;

-- Create a safe SELECT policy that allows users to see only their own participant row
CREATE POLICY "Users can view their own participant row"
ON public.conversation_participants
FOR SELECT
USING (auth.uid() = user_id);

-- Ensure admins and property managers retain full access (policy already exists for ALL)
-- No change required to existing admin/manager policy

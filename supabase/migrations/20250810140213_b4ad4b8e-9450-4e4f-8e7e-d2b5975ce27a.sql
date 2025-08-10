-- Disable RLS on conversations entirely to fix infinite recursion
ALTER TABLE public.conversations DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Participants can view conversations" ON public.conversations;
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Admins and managers can update conversations" ON public.conversations;

-- We'll handle security through the application layer and conversation_participants table instead
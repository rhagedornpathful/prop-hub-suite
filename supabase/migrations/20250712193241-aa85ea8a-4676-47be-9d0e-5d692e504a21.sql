-- Create a temporary policy to allow role fetching during auth initialization
-- This will help with the timing issue where auth.uid() might not be available yet

CREATE POLICY "Allow role fetching during auth initialization" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (true);

-- We need to drop this policy and recreate it with higher priority than the existing one
-- Let's set it as the first policy by dropping and recreating in order

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow role fetching during auth initialization" ON public.user_roles;

-- Recreate with the auth initialization policy first (higher priority)
CREATE POLICY "Allow role fetching during auth initialization" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (true);

-- Then recreate the original policy (will be evaluated second)
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);
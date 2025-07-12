-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Property managers can view roles" ON public.user_roles;

-- Create comprehensive RLS policies for user_roles table

-- Policy to allow users to view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy to allow first admin creation or users creating their first role
CREATE POLICY "Allow first admin or self insert"
ON public.user_roles
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND (
    NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
    OR 
    NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid())
  )
);

-- Policy to allow admins to manage all roles (UPDATE and DELETE)
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Policy to allow property managers to view all roles
CREATE POLICY "Property managers can view roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'property_manager'));
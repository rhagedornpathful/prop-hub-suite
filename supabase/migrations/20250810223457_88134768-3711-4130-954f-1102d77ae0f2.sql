-- Fix infinite recursion by using security definer functions
-- Drop the problematic policies first
DROP POLICY IF EXISTS "Enable read access for authenticated users on their own roles" ON user_roles;
DROP POLICY IF EXISTS "Enable admins to read all user roles" ON user_roles;
DROP POLICY IF EXISTS "Enable admins to insert user roles" ON user_roles;
DROP POLICY IF EXISTS "Enable admins to update user roles" ON user_roles;
DROP POLICY IF EXISTS "Enable admins to delete user roles" ON user_roles;

-- Create a security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'is_admin' = 'true'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = 'public', 'pg_temp';

-- Create simple, non-recursive policies
CREATE POLICY "Users can view their own roles" 
ON user_roles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
ON user_roles FOR SELECT 
USING (public.is_user_admin());

CREATE POLICY "Admins can insert roles" 
ON user_roles FOR INSERT 
WITH CHECK (public.is_user_admin());

CREATE POLICY "Admins can update roles" 
ON user_roles FOR UPDATE 
USING (public.is_user_admin());

CREATE POLICY "Admins can delete roles" 
ON user_roles FOR DELETE 
USING (public.is_user_admin());
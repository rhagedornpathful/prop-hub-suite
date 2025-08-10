-- Drop ALL existing policies on user_roles to start fresh
DROP POLICY IF EXISTS "Users can view their own user roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can insert user roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can update user roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can delete user roles" ON user_roles;
DROP POLICY IF EXISTS "Public can check if admin exists for setup" ON user_roles;

-- Create simple, non-recursive policies that don't reference the same table
CREATE POLICY "Allow users to read their own roles" 
ON user_roles FOR SELECT 
USING (auth.uid() = user_id);

-- Allow service role (used by functions) to manage all roles
CREATE POLICY "Allow service role full access" 
ON user_roles FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

-- For now, let's also allow authenticated users to read any role for admin checks
-- This is temporary to get the app working
CREATE POLICY "Allow authenticated users to read roles for admin checks" 
ON user_roles FOR SELECT 
USING (auth.role() = 'authenticated');
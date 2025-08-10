-- Create a function to check if any admin exists (bypasses RLS)
CREATE OR REPLACE FUNCTION public.check_admin_exists()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE role = 'admin'
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = 'public', 'pg_temp';

-- Create a simpler policy for the public setup check that allows reading admin count
CREATE POLICY "Public can check if admin exists for setup" 
ON user_roles FOR SELECT 
USING (role = 'admin');
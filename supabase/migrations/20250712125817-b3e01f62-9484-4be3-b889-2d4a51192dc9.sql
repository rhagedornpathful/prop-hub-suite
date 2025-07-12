-- Add missing updated_at column to existing user_roles table
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add missing created_at column (rename assigned_at if needed)
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Update existing data to set created_at from assigned_at if it exists
UPDATE public.user_roles 
SET created_at = assigned_at 
WHERE created_at IS NULL AND assigned_at IS NOT NULL;

-- Add trigger for updated_at if it doesn't exist
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Update the existing handle_new_user function to assign default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Insert into profiles table (if it exists)
  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  
  -- Assign default role (admin for now, can be changed later)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'admin');
  
  RETURN NEW;
END;
$$;

-- Create user_profiles view that joins auth.users with user_roles
CREATE OR REPLACE VIEW public.user_profiles AS
SELECT 
    u.id,
    u.email,
    u.created_at as user_created_at,
    u.updated_at as user_updated_at,
    u.email_confirmed_at,
    u.last_sign_in_at,
    p.first_name,
    p.last_name,
    p.company_name,
    p.phone,
    p.address,
    p.city,
    p.state,
    p.zip_code,
    ur.role,
    ur.created_at as role_created_at,
    ur.updated_at as role_updated_at,
    ur.assigned_by,
    ur.assigned_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id;

-- Grant permissions on the view
GRANT SELECT ON public.user_profiles TO authenticated;

-- Add indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
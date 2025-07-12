-- Create an enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'property_owner', 'tenant', 'house_watcher');

-- Create the user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create a security definer function to check if a user has a specific role
-- This prevents RLS recursion issues
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create a function to get all roles for a user
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS app_role[]
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT ARRAY_AGG(role) 
  FROM public.user_roles 
  WHERE user_id = _user_id
$$;

-- RLS Policies
-- Users can read their own role
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Only admins can manage all roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Property managers can view roles (but not modify)
CREATE POLICY "Property managers can view roles"
ON public.user_roles
FOR SELECT
USING (has_role(auth.uid(), 'property_manager'));

-- Create trigger function for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user registration
-- Automatically assigns 'admin' role for now (can be modified later)
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
  
  -- Assign default role (admin for now, can be changed to 'property_owner' later)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'admin');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

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
    ur.updated_at as role_updated_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id;

-- Grant permissions on the view
GRANT SELECT ON public.user_profiles TO authenticated;

-- Create RLS policy for the view
CREATE POLICY "Users can view their own profile"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = id);

-- Add index for better performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
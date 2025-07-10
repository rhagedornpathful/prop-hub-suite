-- Create user roles system with comprehensive role-based access control

-- Create enum for all app roles
CREATE TYPE public.app_role AS ENUM (
  'admin',
  'property_manager', 
  'house_watcher',
  'client',
  'contractor',
  'tenant',
  'owner_investor',
  'leasing_agent'
);

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  company_name TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on new tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
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

-- Create function to get user roles
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

-- RLS policies for profiles table
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Property managers can view roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'property_manager'));

-- Update existing table policies for role-based access

-- Properties table - enhanced policies
DROP POLICY IF EXISTS "Users can view their own properties" ON public.properties;
DROP POLICY IF EXISTS "Users can add their own properties" ON public.properties;
DROP POLICY IF EXISTS "Users can update their own properties" ON public.properties;
DROP POLICY IF EXISTS "Users can delete their own properties" ON public.properties;

CREATE POLICY "Property owners can manage their properties"
ON public.properties FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Property managers can view all properties"
ON public.properties FOR SELECT
USING (public.has_role(auth.uid(), 'property_manager'));

CREATE POLICY "Admins can manage all properties"
ON public.properties FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "House watchers can view assigned properties"
ON public.properties FOR SELECT
USING (public.has_role(auth.uid(), 'house_watcher'));

-- Tenants table - enhanced policies
DROP POLICY IF EXISTS "Users can view their own tenants" ON public.tenants;
DROP POLICY IF EXISTS "Users can create their own tenants" ON public.tenants;
DROP POLICY IF EXISTS "Users can update their own tenants" ON public.tenants;
DROP POLICY IF EXISTS "Users can delete their own tenants" ON public.tenants;

CREATE POLICY "Property owners can manage their tenants"
ON public.tenants FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Property managers can manage all tenants"
ON public.tenants FOR ALL
USING (public.has_role(auth.uid(), 'property_manager'));

CREATE POLICY "Admins can manage all tenants"
ON public.tenants FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Maintenance requests - enhanced policies
DROP POLICY IF EXISTS "Users can view their own maintenance requests" ON public.maintenance_requests;
DROP POLICY IF EXISTS "Users can create their own maintenance requests" ON public.maintenance_requests;
DROP POLICY IF EXISTS "Users can update their own maintenance requests" ON public.maintenance_requests;
DROP POLICY IF EXISTS "Users can delete their own maintenance requests" ON public.maintenance_requests;

CREATE POLICY "Property owners can manage their maintenance requests"
ON public.maintenance_requests FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Property managers can manage all maintenance requests"
ON public.maintenance_requests FOR ALL
USING (public.has_role(auth.uid(), 'property_manager'));

CREATE POLICY "Contractors can view and update assigned requests"
ON public.maintenance_requests FOR SELECT
USING (public.has_role(auth.uid(), 'contractor'));

CREATE POLICY "Contractors can update maintenance requests"
ON public.maintenance_requests FOR UPDATE
USING (public.has_role(auth.uid(), 'contractor'));

CREATE POLICY "Admins can manage all maintenance requests"
ON public.maintenance_requests FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- House watching - enhanced policies  
DROP POLICY IF EXISTS "Users can view their own house watching properties" ON public.house_watching;
DROP POLICY IF EXISTS "Users can add their own house watching properties" ON public.house_watching;
DROP POLICY IF EXISTS "Users can update their own house watching properties" ON public.house_watching;
DROP POLICY IF EXISTS "Users can delete their own house watching properties" ON public.house_watching;

CREATE POLICY "Property owners can manage their house watching"
ON public.house_watching FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "House watchers can view and update assigned properties"
ON public.house_watching FOR SELECT
USING (public.has_role(auth.uid(), 'house_watcher'));

CREATE POLICY "House watchers can update house watching records"
ON public.house_watching FOR UPDATE
USING (public.has_role(auth.uid(), 'house_watcher'));

CREATE POLICY "Property managers can manage all house watching"
ON public.house_watching FOR ALL
USING (public.has_role(auth.uid(), 'property_manager'));

CREATE POLICY "Admins can manage all house watching"
ON public.house_watching FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Documents - enhanced policies
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can upload their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;

CREATE POLICY "Document owners can manage their documents"
ON public.documents FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Property managers can view all documents"
ON public.documents FOR SELECT
USING (public.has_role(auth.uid(), 'property_manager'));

CREATE POLICY "Admins can manage all documents"
ON public.documents FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create triggers for automatic timestamp updates on new tables
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup (creates profile and assigns default role)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  
  -- Assign default role (client) to new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client');
  
  RETURN NEW;
END;
$$;

-- Create trigger to handle new user signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
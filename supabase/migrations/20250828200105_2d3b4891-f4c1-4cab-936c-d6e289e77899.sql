-- Check and update vendor table policies
DROP POLICY IF EXISTS "Authenticated users can view vendors" ON public.vendors;
DROP POLICY IF EXISTS "Admins can manage all vendors" ON public.vendors;
DROP POLICY IF EXISTS "Property managers can manage all vendors" ON public.vendors;
DROP POLICY IF EXISTS "Vendors can manage their own profile" ON public.vendors;

-- Create new restricted vendor policies
CREATE POLICY "Admins can manage all vendors" ON public.vendors
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can view vendors" ON public.vendors
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'property_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Vendors can manage their own profile" ON public.vendors
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Fix services table access
DROP POLICY IF EXISTS "Services are viewable by authenticated users" ON public.services;

CREATE POLICY "Authenticated users with proper roles can view services" ON public.services
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'property_manager'::app_role) OR 
    has_role(auth.uid(), 'owner_investor'::app_role) OR
    has_role(auth.uid(), 'tenant'::app_role)
  );
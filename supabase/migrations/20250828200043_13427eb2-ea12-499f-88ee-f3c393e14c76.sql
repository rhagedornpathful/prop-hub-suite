-- Fix vendor data access restrictions
-- Remove public access policies for vendors table
DROP POLICY IF EXISTS "Authenticated users can view vendors" ON public.vendors;

-- Add restricted vendor access policies
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

-- Fix vendor reviews access
ALTER TABLE public.vendor_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all vendor reviews" ON public.vendor_reviews
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can view vendor reviews" ON public.vendor_reviews
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'property_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can manage reviews they created" ON public.vendor_reviews
  FOR ALL TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

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

-- Fix property manager assignments access
ALTER TABLE public.property_manager_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all property manager assignments" ON public.property_manager_assignments
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can view their assignments" ON public.property_manager_assignments
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    manager_user_id = auth.uid()
  );

CREATE POLICY "Property owners can view assignments for their properties" ON public.property_manager_assignments
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    property_id IN (
      SELECT p.id FROM properties p
      JOIN property_owners po ON po.id = p.owner_id
      WHERE po.user_id = auth.uid()
    )
  );
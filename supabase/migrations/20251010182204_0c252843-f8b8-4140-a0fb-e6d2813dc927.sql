-- Fix RLS policies for property_manager_assignments table
-- Drop existing public policies
DROP POLICY IF EXISTS "Authenticated users can view property manager assignments" ON public.property_manager_assignments;
DROP POLICY IF EXISTS "Property manager assignments are viewable by authenticated u" ON public.property_manager_assignments;

-- Create restrictive policies for property_manager_assignments
CREATE POLICY "Admins can manage all property manager assignments"
ON public.property_manager_assignments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can view their own assignments"
ON public.property_manager_assignments
FOR SELECT
TO authenticated
USING (manager_user_id = auth.uid() OR public.has_role(auth.uid(), 'property_manager'::app_role));

CREATE POLICY "Property owners can view assignments for their properties"
ON public.property_manager_assignments
FOR SELECT
TO authenticated
USING (
  property_id IN (
    SELECT p.id
    FROM public.properties p
    JOIN public.property_owners po ON po.id = p.owner_id
    WHERE po.user_id = auth.uid()
  )
);

-- Fix RLS policies for vendor_reviews table
-- Drop existing public policies
DROP POLICY IF EXISTS "Authenticated users can view vendor reviews" ON public.vendor_reviews;
DROP POLICY IF EXISTS "Vendor reviews are viewable by authenticated users" ON public.vendor_reviews;

-- Create restrictive policies for vendor_reviews
CREATE POLICY "Admins can manage all vendor reviews"
ON public.vendor_reviews
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can view vendor reviews"
ON public.vendor_reviews
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'property_manager'::app_role));

CREATE POLICY "Vendors can view their own reviews"
ON public.vendor_reviews
FOR SELECT
TO authenticated
USING (
  vendor_id IN (
    SELECT id FROM public.vendors WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Property managers can create vendor reviews"
ON public.vendor_reviews
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'property_manager'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role));
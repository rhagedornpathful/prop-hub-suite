-- Fix infinite recursion by using security definer functions with correct column names
-- First, drop ALL problematic policies

-- Drop all policies on property_manager_assignments to start fresh
DROP POLICY IF EXISTS "property_manager_view_own_assignments" ON property_manager_assignments;
DROP POLICY IF EXISTS "property_owner_view_manager_assignments" ON property_manager_assignments;
DROP POLICY IF EXISTS "admin_full_access_manager_assignments" ON property_manager_assignments;
DROP POLICY IF EXISTS "property_owner_view_assignments_simple" ON property_manager_assignments;
DROP POLICY IF EXISTS "view_pm_assignments" ON property_manager_assignments;
DROP POLICY IF EXISTS "admin_manage_pm_assignments" ON property_manager_assignments;

-- Create a security definer function to check if user can view property manager assignment
CREATE OR REPLACE FUNCTION public.user_can_view_pm_assignment(_assignment_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Admins can view all
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id
    AND role = 'admin'
  )
  OR
  -- Property managers can view their own assignments
  EXISTS (
    SELECT 1 FROM property_manager_assignments
    WHERE id = _assignment_id
    AND manager_user_id = _user_id
  )
  OR
  -- Property owners can view assignments for their properties
  EXISTS (
    SELECT 1 FROM property_manager_assignments pma
    JOIN property_owner_associations poa ON poa.property_id = pma.property_id
    WHERE pma.id = _assignment_id
    AND poa.property_owner_id = _user_id
  );
$$;

-- Create simple, non-recursive policies using the security definer function
CREATE POLICY "view_pm_assignments"
  ON property_manager_assignments
  FOR SELECT
  USING (user_can_view_pm_assignment(id, auth.uid()));

CREATE POLICY "admin_manage_pm_assignments"
  ON property_manager_assignments
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Fix vendor_reviews policies to be non-recursive
DROP POLICY IF EXISTS "admin_full_access_vendor_reviews" ON vendor_reviews;
DROP POLICY IF EXISTS "property_managers_create_vendor_reviews" ON vendor_reviews;
DROP POLICY IF EXISTS "property_managers_view_vendor_reviews" ON vendor_reviews;
DROP POLICY IF EXISTS "vendors_view_own_reviews" ON vendor_reviews;
DROP POLICY IF EXISTS "admin_manage_vendor_reviews" ON vendor_reviews;
DROP POLICY IF EXISTS "pm_view_vendor_reviews" ON vendor_reviews;
DROP POLICY IF EXISTS "vendors_view_their_reviews" ON vendor_reviews;
DROP POLICY IF EXISTS "pm_create_vendor_reviews" ON vendor_reviews;

CREATE POLICY "admin_all_vendor_reviews"
  ON vendor_reviews
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "pm_select_vendor_reviews"
  ON vendor_reviews
  FOR SELECT
  USING (has_role(auth.uid(), 'property_manager'));

CREATE POLICY "vendor_select_own_reviews"
  ON vendor_reviews
  FOR SELECT
  USING (vendor_id = auth.uid());

CREATE POLICY "admin_pm_insert_vendor_reviews"
  ON vendor_reviews
  FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin') 
    OR has_role(auth.uid(), 'property_manager')
  );
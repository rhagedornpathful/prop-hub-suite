-- Fix RLS policies for property_service_assignments table
-- Drop all existing policies first
DROP POLICY IF EXISTS "Admins can manage all service assignments" ON property_service_assignments;
DROP POLICY IF EXISTS "Property managers can manage service assignments" ON property_service_assignments;
DROP POLICY IF EXISTS "Property owners can view service assignments for their properties" ON property_service_assignments;
DROP POLICY IF EXISTS "Users can view service assignments for properties they own" ON property_service_assignments;

-- Create simple, working RLS policies
CREATE POLICY "Admins can do everything"
ON property_service_assignments
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Property managers can do everything"
ON property_service_assignments
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'property_manager'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'property_manager'
  )
);

CREATE POLICY "Property owners can view their assignments"
ON property_service_assignments
FOR SELECT 
TO authenticated
USING (
  property_id IN (
    SELECT p.id FROM properties p WHERE p.user_id = auth.uid()
  )
);
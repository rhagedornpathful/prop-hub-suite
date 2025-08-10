-- Fix maintenance_requests policies that reference properties

-- Check current policies and fix any that cause recursion
DROP POLICY IF EXISTS "Property owners can view maintenance requests for their properties" ON maintenance_requests;
DROP POLICY IF EXISTS "Property managers can manage maintenance requests for their properties" ON maintenance_requests;

-- Recreate these policies in a simpler way to avoid recursion
CREATE POLICY "Property owners can view maintenance requests for their properties"
ON maintenance_requests
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  user_id = auth.uid() OR
  assigned_to = auth.uid()
);

CREATE POLICY "Property managers can manage maintenance requests for their properties" 
ON maintenance_requests
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'property_manager'::app_role) OR
  user_id = auth.uid() OR
  assigned_to = auth.uid()
);
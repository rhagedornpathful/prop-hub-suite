-- Enable RLS on property_service_assignments if not already enabled
ALTER TABLE property_service_assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Admins can manage all service assignments" ON property_service_assignments;
DROP POLICY IF EXISTS "Property managers can manage service assignments" ON property_service_assignments;
DROP POLICY IF EXISTS "Property owners can view their assignments" ON property_service_assignments;
DROP POLICY IF EXISTS "Users can view service assignments for their properties" ON property_service_assignments;

-- Create comprehensive RLS policies for property_service_assignments
CREATE POLICY "Admins can manage all service assignments"
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

CREATE POLICY "Property managers can manage service assignments"
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

CREATE POLICY "Property owners can view service assignments for their properties"
ON property_service_assignments
FOR SELECT 
TO authenticated
USING (
  property_id IN (
    SELECT p.id 
    FROM properties p
    JOIN property_owner_associations poa ON poa.property_id = p.id
    JOIN property_owners po ON po.id = poa.property_owner_id
    WHERE po.user_id = auth.uid()
  )
  OR 
  property_id IN (
    SELECT id FROM properties WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can view service assignments for properties they own"
ON property_service_assignments
FOR SELECT 
TO authenticated
USING (
  property_id IN (
    SELECT id FROM properties WHERE user_id = auth.uid()
  )
);
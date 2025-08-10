-- First, let's check what the current property managers can see
-- by looking at existing policies for tenants table

-- Drop the overly broad policy that allows property managers to see all tenants
DROP POLICY IF EXISTS "Property managers can manage all tenants" ON public.tenants;

-- Create a restrictive policy for property managers to only see tenants of their assigned properties
CREATE POLICY "Property managers can manage tenants for their properties" 
ON public.tenants 
FOR ALL 
USING (
  (EXISTS ( SELECT 1 FROM user_roles WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::app_role)))) OR
  (user_id = auth.uid()) OR
  (user_account_id = auth.uid()) OR
  (EXISTS ( SELECT 1 
    FROM user_roles ur
    JOIN property_manager_assignments pma ON pma.manager_user_id = ur.user_id
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'property_manager'::app_role 
    AND pma.property_id = tenants.property_id
  ))
)
WITH CHECK (
  (EXISTS ( SELECT 1 FROM user_roles WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::app_role)))) OR
  (user_id = auth.uid()) OR
  (user_account_id = auth.uid()) OR
  (EXISTS ( SELECT 1 
    FROM user_roles ur
    JOIN property_manager_assignments pma ON pma.manager_user_id = ur.user_id
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'property_manager'::app_role 
    AND pma.property_id = tenants.property_id
  ))
);

-- Drop the overly broad policy for property check sessions
DROP POLICY IF EXISTS "Property managers can manage all property check sessions" ON public.property_check_sessions;

-- Create a restrictive policy for property managers to only see check sessions for their assigned properties
CREATE POLICY "Property managers can manage check sessions for their properties" 
ON public.property_check_sessions 
FOR ALL 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  (auth.uid() = user_id) OR
  (EXISTS ( SELECT 1 
    FROM property_manager_assignments pma
    WHERE pma.manager_user_id = auth.uid() 
    AND pma.property_id = property_check_sessions.property_id
  ))
);

-- Update the maintenance requests policy to be more restrictive for property managers
DROP POLICY IF EXISTS "Property managers can manage all maintenance requests" ON public.maintenance_requests;

CREATE POLICY "Property managers can manage maintenance for their properties" 
ON public.maintenance_requests 
FOR ALL 
USING (
  (EXISTS ( SELECT 1 FROM user_roles WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::app_role)))) OR
  (assigned_to = auth.uid()) OR
  (user_id = auth.uid()) OR
  (property_id IN ( SELECT p.id FROM (properties p JOIN property_owners po ON ((po.id = p.owner_id))) WHERE (po.user_id = auth.uid()))) OR
  (property_id IN ( SELECT t.property_id FROM tenants t WHERE (t.user_account_id = auth.uid()))) OR
  (EXISTS ( SELECT 1 
    FROM property_manager_assignments pma
    WHERE pma.manager_user_id = auth.uid() 
    AND pma.property_id = maintenance_requests.property_id
  ))
);
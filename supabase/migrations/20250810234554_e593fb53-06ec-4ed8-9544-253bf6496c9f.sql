-- Fix all remaining infinite recursion issues in properties policies

-- First, drop all existing policies on properties table
DROP POLICY IF EXISTS "Admins can manage all properties" ON properties;
DROP POLICY IF EXISTS "Property managers can manage all properties" ON properties;  
DROP POLICY IF EXISTS "Tenants can view their assigned property" ON properties;

-- Recreate all policies without recursion

-- Admin policy (should be safe)
CREATE POLICY "Admins can manage all properties"
ON properties
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Property managers policy (should be safe)  
CREATE POLICY "Property managers can manage all properties"
ON properties
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'property_manager'::app_role));

-- Tenants policy - simplified to avoid recursion
CREATE POLICY "Tenants can view their assigned property"
ON properties
FOR SELECT
TO authenticated  
USING (
  id IN (
    SELECT property_id FROM tenants WHERE user_account_id = auth.uid()
  )
);
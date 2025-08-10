-- Check and fix all policies that might be causing infinite recursion

-- First, let's check the house_watching policies that might reference properties
DROP POLICY IF EXISTS "House watchers can manage their assigned house watching" ON house_watching;

-- Recreate without the complex property address matching that causes recursion
CREATE POLICY "House watchers can manage their assigned house watching"
ON house_watching
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'property_manager'::app_role) OR 
  user_id = auth.uid()
);

-- Fix property_owners policy that might cause issues with properties joins
DROP POLICY IF EXISTS "House watchers can view property owners for assigned properties" ON property_owners;

CREATE POLICY "House watchers can view property owners for assigned properties"
ON property_owners
FOR SELECT
TO authenticated  
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'property_manager'::app_role) OR 
  user_id = auth.uid()
);
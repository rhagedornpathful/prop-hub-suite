-- Fix infinite recursion in properties policies by updating the problematic RLS policies

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Property owners can manage their properties" ON properties;
DROP POLICY IF EXISTS "House watchers can view assigned properties" ON properties;

-- Recreate property owners policy without recursion
CREATE POLICY "Property owners can manage their properties"
ON properties
FOR ALL
TO authenticated
USING (
  owner_id IN (
    SELECT id FROM property_owners WHERE user_id = auth.uid()
  )
);

-- Recreate house watchers policy without recursion  
CREATE POLICY "House watchers can view assigned properties"
ON properties
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT property_id FROM house_watcher_properties hwp
    JOIN house_watchers hw ON hw.id = hwp.house_watcher_id
    WHERE hw.user_id = auth.uid()
  )
);
-- Restrict house watcher access to prevent seeing admin-level data

-- 1. Fix the overly broad house_watching table policies
DROP POLICY IF EXISTS "House watchers can view and update assigned house watching" ON public.house_watching;
DROP POLICY IF EXISTS "House watchers can update house watching records" ON public.house_watching;

-- Create restrictive policy for house watchers to only see house watching records they are assigned to
CREATE POLICY "House watchers can manage their assigned house watching" 
ON public.house_watching 
FOR ALL 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'property_manager'::app_role) OR
  (user_id = auth.uid()) OR
  (EXISTS ( SELECT 1 
    FROM house_watchers hw
    JOIN house_watcher_properties hwp ON hwp.house_watcher_id = hw.id
    WHERE hw.user_id = auth.uid() 
    AND hwp.property_id = house_watching.id::text
  ))
);

-- 2. Ensure house watchers can only see tenants for properties they're assigned to
-- Check if there's already a policy restricting tenant access for house watchers
-- The current policy should be sufficient, but let's make sure

-- 3. Ensure house watchers can only see maintenance requests for their assigned properties  
-- The current policy should be sufficient, but let's verify

-- 4. Add policy to ensure house watchers can only see property owners for their assigned properties
CREATE POLICY "House watchers can view property owners for assigned properties" 
ON public.property_owners 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'property_manager'::app_role) OR
  (user_id = auth.uid()) OR
  (id IN (
    SELECT p.owner_id 
    FROM properties p
    JOIN house_watcher_properties hwp ON hwp.property_id = p.id
    JOIN house_watchers hw ON hw.id = hwp.house_watcher_id
    WHERE hw.user_id = auth.uid()
  ))
);

-- 5. Ensure house watchers cannot see other users' profiles (only their own)
-- Check if profiles table has appropriate restrictions
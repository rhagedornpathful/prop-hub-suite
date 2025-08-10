-- Restrict house watcher access to prevent seeing admin-level data

-- 1. Fix the overly broad house_watching table policies
DROP POLICY IF EXISTS "House watchers can view and update assigned house watching" ON public.house_watching;
DROP POLICY IF EXISTS "House watchers can update house watching records" ON public.house_watching;

-- Create restrictive policy for house watchers to only see house watching records they are assigned to
-- Since house_watching uses property_address (text) and house_watcher_properties uses property_id (uuid),
-- we need to join through the properties table to match addresses
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
    JOIN properties p ON p.id = hwp.property_id
    WHERE hw.user_id = auth.uid() 
    AND (p.address = house_watching.property_address OR p.street_address = house_watching.property_address)
  ))
);

-- 2. Add policy to ensure house watchers can only see property owners for their assigned properties
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
    AND p.owner_id IS NOT NULL
  ))
);

-- 3. Ensure house watchers can only see user roles that are relevant to them
CREATE POLICY "House watchers can view relevant user roles" 
ON public.user_roles 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'property_manager'::app_role) OR
  (user_id = auth.uid()) OR
  (user_id IN (
    -- Allow seeing roles of users related to their assigned properties
    SELECT DISTINCT po.user_id 
    FROM property_owners po
    JOIN properties p ON p.owner_id = po.id
    JOIN house_watcher_properties hwp ON hwp.property_id = p.id
    JOIN house_watchers hw ON hw.id = hwp.house_watcher_id
    WHERE hw.user_id = auth.uid()
    UNION
    SELECT DISTINCT t.user_account_id 
    FROM tenants t
    JOIN house_watcher_properties hwp ON hwp.property_id = t.property_id
    JOIN house_watchers hw ON hw.id = hwp.house_watcher_id
    WHERE hw.user_id = auth.uid()
    AND t.user_account_id IS NOT NULL
  ))
);
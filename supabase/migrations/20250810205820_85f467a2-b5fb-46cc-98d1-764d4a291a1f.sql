-- Fix #12: Security & RLS Policy Verification
-- Add missing RLS policies for house watcher data access

-- Ensure house_watcher_settings has proper RLS
DROP POLICY IF EXISTS "House watchers can manage their settings" ON house_watcher_settings;
CREATE POLICY "House watchers can manage their settings" 
ON house_watcher_settings 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Add policy for property managers to view house watcher settings
CREATE POLICY "Property managers can view house watcher settings" 
ON house_watcher_settings 
FOR SELECT 
USING (has_role(auth.uid(), 'property_manager'::app_role));

-- Ensure home_check_sessions has comprehensive policies
DROP POLICY IF EXISTS "Property managers can manage all home check sessions" ON home_check_sessions;
CREATE POLICY "Property managers can manage all home check sessions" 
ON home_check_sessions 
FOR ALL 
USING (has_role(auth.uid(), 'property_manager'::app_role));

-- Add policy for property owners to view checks on their properties
CREATE POLICY "Property owners can view checks on their properties" 
ON home_check_sessions 
FOR SELECT 
USING (
  property_id IN (
    SELECT hw.id 
    FROM house_watching hw 
    JOIN property_owners po ON po.user_id = auth.uid()
    WHERE hw.property_address IN (
      SELECT address FROM properties WHERE owner_id = po.id
    )
  )
);

-- Fix #13: Role Assignment Security
-- Add trigger to prevent unauthorized role changes
CREATE OR REPLACE FUNCTION public.validate_house_watcher_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Only admins and property managers can create house watcher assignments
  IF NOT (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'property_manager'::app_role)
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to assign house watchers';
  END IF;
  
  -- Ensure the assigned user actually has house_watcher role
  IF NOT has_role(NEW.user_id, 'house_watcher'::app_role) THEN
    RAISE EXCEPTION 'Cannot assign user without house_watcher role';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
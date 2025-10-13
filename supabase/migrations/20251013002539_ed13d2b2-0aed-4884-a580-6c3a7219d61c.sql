-- CRITICAL SECURITY FIX: House Watcher Data Isolation
-- Ensure house watchers can only access their assigned properties and related data

-- First, check if house_watchers table exists and has proper structure
-- This table should link user_id to house_watcher records

-- Create security definer function to check if user is a house watcher for a property
CREATE OR REPLACE FUNCTION public.user_is_house_watcher_for_property(_property_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.house_watchers hw
    JOIN public.house_watcher_properties hwp ON hwp.house_watcher_id = hw.id
    WHERE hwp.property_id = _property_id
      AND hw.user_id = _user_id
  );
$$;

-- Update house_watching RLS policies to ensure house watchers can only see their assigned properties
DROP POLICY IF EXISTS "House watchers can only view their assigned house watching records" ON public.house_watching;

CREATE POLICY "House watchers can only view their assigned house watching records"
ON public.house_watching
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin') 
  OR has_role(auth.uid(), 'property_manager')
  OR user_id = auth.uid()
  OR (
    has_role(auth.uid(), 'house_watcher')
    AND property_id IN (
      SELECT hwp.property_id
      FROM public.house_watchers hw
      JOIN public.house_watcher_properties hwp ON hwp.house_watcher_id = hw.id
      WHERE hw.user_id = auth.uid()
    )
  )
);

-- House watchers can only update their own assigned records
DROP POLICY IF EXISTS "House watchers can only update their assigned records" ON public.house_watching;

CREATE POLICY "House watchers can only update their assigned records"
ON public.house_watching
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'property_manager')
  OR (
    has_role(auth.uid(), 'house_watcher')
    AND user_id = auth.uid()
  )
);

-- Update property_check_sessions (home_check_sessions) to ensure proper isolation
DROP POLICY IF EXISTS "House watchers can only view their own check sessions" ON public.property_check_sessions;

CREATE POLICY "House watchers can only view their own check sessions"
ON public.property_check_sessions
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin')
  OR user_id = auth.uid()
  OR (
    has_role(auth.uid(), 'property_manager')
    AND (property_id)::uuid IN (
      SELECT pma.property_id
      FROM public.property_manager_assignments pma
      WHERE pma.manager_user_id = auth.uid()
    )
  )
  OR (
    -- Property owners can view check sessions for their properties
    (property_id)::uuid IN (
      SELECT poa.property_id
      FROM public.property_owner_associations poa
      JOIN public.property_owners po ON po.id = poa.property_owner_id
      WHERE po.user_id = auth.uid()
    )
  )
);

-- House watchers can only manage their own check sessions
DROP POLICY IF EXISTS "House watchers can only manage their own check sessions" ON public.property_check_sessions;

CREATE POLICY "House watchers can only manage their own check sessions"
ON public.property_check_sessions
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'property_manager')
  OR user_id = auth.uid()
)
WITH CHECK (
  has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'property_manager')
  OR (
    user_id = auth.uid()
    AND (
      -- Ensure house watcher can only create sessions for their assigned properties
      NOT has_role(auth.uid(), 'house_watcher')
      OR (property_id)::uuid IN (
        SELECT hwp.property_id
        FROM public.house_watchers hw
        JOIN public.house_watcher_properties hwp ON hwp.house_watcher_id = hw.id
        WHERE hw.user_id = auth.uid()
      )
    )
  )
);

-- Ensure home_check_activities are isolated to the house watcher's sessions only
DROP POLICY IF EXISTS "House watchers can only view their own check activities" ON public.home_check_activities;

CREATE POLICY "House watchers can only view their own check activities"
ON public.home_check_activities
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin')
  OR user_id = auth.uid()
);

-- Add comment documenting the security function
COMMENT ON FUNCTION public.user_is_house_watcher_for_property IS 'Security function to check if a user is assigned as a house watcher for a specific property';

-- Ensure house_watchers table has proper RLS if it exists
-- Note: We need to ensure house watchers can only see their own record
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'house_watchers'
  ) THEN
    -- Enable RLS if not already enabled
    EXECUTE 'ALTER TABLE public.house_watchers ENABLE ROW LEVEL SECURITY';
    
    -- Drop existing policies
    DROP POLICY IF EXISTS "House watchers can view their own record" ON public.house_watchers;
    DROP POLICY IF EXISTS "Admins can manage house watchers" ON public.house_watchers;
    DROP POLICY IF EXISTS "Property managers can manage house watchers" ON public.house_watchers;
    
    -- Create new policies
    CREATE POLICY "House watchers can view their own record"
    ON public.house_watchers
    FOR SELECT
    TO authenticated
    USING (
      has_role(auth.uid(), 'admin')
      OR has_role(auth.uid(), 'property_manager')
      OR user_id = auth.uid()
    );
    
    CREATE POLICY "Admins can manage house watchers"
    ON public.house_watchers
    FOR ALL
    TO authenticated
    USING (has_role(auth.uid(), 'admin'))
    WITH CHECK (has_role(auth.uid(), 'admin'));
    
    CREATE POLICY "Property managers can manage house watchers"
    ON public.house_watchers
    FOR ALL
    TO authenticated
    USING (has_role(auth.uid(), 'property_manager'))
    WITH CHECK (has_role(auth.uid(), 'property_manager'));
  END IF;
END $$;
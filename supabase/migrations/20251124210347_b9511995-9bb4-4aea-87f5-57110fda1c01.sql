-- ============================================================================
-- CRITICAL FIX: Infinite Recursion in RLS Policies
-- ============================================================================
-- Issue: Phase 1 policies created circular dependencies on property_owner_associations
-- Solution: Simplify policies to break recursion chains
-- ============================================================================

-- ----------------------------------------------------------------------------
-- FIX #1: Simplify profiles property manager policy to avoid recursion
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "profiles_property_managers_view_managed_users" ON public.profiles;

-- New simplified policy without property_owner_associations recursion
CREATE POLICY "profiles_property_managers_view_managed_users"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'property_manager'::app_role) 
    AND (
      -- Tenants in managed properties
      user_id IN (
        SELECT t.user_account_id
        FROM tenants t
        JOIN property_manager_assignments pma ON pma.property_id = t.property_id
        WHERE pma.manager_user_id = auth.uid()
          AND t.user_account_id IS NOT NULL
      )
      OR
      -- House watchers assigned to managed properties
      user_id IN (
        SELECT hw.user_id
        FROM house_watchers hw
        JOIN house_watcher_properties hwp ON hwp.house_watcher_id = hw.id
        JOIN property_manager_assignments pma ON pma.property_id = hwp.property_id
        WHERE pma.manager_user_id = auth.uid()
      )
      OR
      -- Property owners - simpler query without associations table
      user_id IN (
        SELECT po.user_id
        FROM property_owners po
        JOIN properties p ON p.owner_id = po.id
        JOIN property_manager_assignments pma ON pma.property_id = p.id
        WHERE pma.manager_user_id = auth.uid()
      )
    )
  );

-- ----------------------------------------------------------------------------
-- FIX #2: Remove the problematic co-owner policy that causes recursion
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "property_owners_view_associated_owners_limited" ON public.property_owners;

-- Don't recreate this policy - co-owners don't need to see each other's data
-- Only admins, property managers, and the owner themselves can access property owner records

-- ----------------------------------------------------------------------------
-- FIX #3: Ensure property_owner_associations policies don't cause recursion
-- ----------------------------------------------------------------------------

-- The existing policies on property_owner_associations look safe, but let's verify
-- by checking if user_can_manage_property_associations function exists and is safe

-- If the function doesn't exist or causes recursion, replace with direct checks
DO $$
BEGIN
  -- Check if function exists
  IF EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'user_can_manage_property_associations'
  ) THEN
    -- Drop problematic policies that use this function
    DROP POLICY IF EXISTS "Owners can add associations for their properties" ON public.property_owner_associations;
    DROP POLICY IF EXISTS "Owners can view associations for their properties" ON public.property_owner_associations;
    
    -- Recreate with simpler, non-recursive logic
    CREATE POLICY "property_owner_associations_owners_view"
      ON public.property_owner_associations
      FOR SELECT
      TO authenticated
      USING (
        -- User is the property owner in this association
        property_owner_id IN (
          SELECT id FROM property_owners WHERE user_id = auth.uid()
        )
        OR
        -- User owns the property (via properties table directly, no recursion)
        property_id IN (
          SELECT p.id 
          FROM properties p
          JOIN property_owners po ON po.id = p.owner_id
          WHERE po.user_id = auth.uid()
        )
      );
    
    CREATE POLICY "property_owner_associations_owners_manage"
      ON public.property_owner_associations
      FOR ALL
      TO authenticated
      USING (
        property_owner_id IN (
          SELECT id FROM property_owners WHERE user_id = auth.uid()
        )
      )
      WITH CHECK (
        property_owner_id IN (
          SELECT id FROM property_owners WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- FIX #4: Add helper function for safe property ownership checks
-- ----------------------------------------------------------------------------

-- This function doesn't recurse because it only checks properties table
CREATE OR REPLACE FUNCTION user_owns_property(property_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM properties p
    JOIN property_owners po ON po.id = p.owner_id
    WHERE p.id = property_uuid
      AND po.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
STABLE;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Test that the policies don't cause recursion:
-- SELECT * FROM maintenance_requests LIMIT 1;
-- SELECT * FROM tenants LIMIT 1;
-- Should work without 500 errors
-- ============================================================================

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- ✅ Removed property_owner_associations references from profiles policy
-- ✅ Removed co-owner viewing policy (unnecessary and caused recursion)
-- ✅ Simplified property_owner_associations policies to avoid recursion
-- ✅ Added safe helper function for property ownership checks
--
-- The infinite recursion error should now be resolved
-- ============================================================================
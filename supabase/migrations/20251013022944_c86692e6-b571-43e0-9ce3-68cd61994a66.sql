-- Break RLS recursion on properties by removing cross-table subqueries
DROP POLICY IF EXISTS "Tenants can view their own property" ON public.properties;

-- Helper functions to avoid referencing RLS tables directly in policies
CREATE OR REPLACE FUNCTION public.user_is_manager_for_property(_property_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.property_manager_assignments pma
    WHERE pma.property_id = _property_id
      AND pma.manager_user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.user_is_owner_for_property(_property_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.property_owner_associations poa
    JOIN public.property_owners po ON po.id = poa.property_owner_id
    WHERE poa.property_id = _property_id
      AND po.user_id = _user_id
  );
$$;

-- Recreate a safe SELECT policy using security definer helpers only
CREATE POLICY "properties_read_access"
ON public.properties
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'property_manager')
  OR public.user_is_tenant_for_property(id, auth.uid())
  OR public.user_is_owner_for_property(id, auth.uid())
  OR public.user_is_manager_for_property(id, auth.uid())
);

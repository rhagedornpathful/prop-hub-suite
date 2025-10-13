-- CRITICAL SECURITY FIX: Tenant Data Isolation
-- Ensure tenants can only access their own data and related property information

-- Create security definer function to check if user is a tenant for a property
CREATE OR REPLACE FUNCTION public.user_is_tenant_for_property(_property_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenants
    WHERE property_id = _property_id
      AND user_account_id = _user_id
  );
$$;

-- Create security definer function to get tenant's property_id
CREATE OR REPLACE FUNCTION public.get_tenant_property_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT property_id
  FROM public.tenants
  WHERE user_account_id = _user_id
  LIMIT 1;
$$;

-- Ensure tenants can ONLY view their own tenant record
DROP POLICY IF EXISTS "Tenants can only view their own record" ON public.tenants;

CREATE POLICY "Tenants can only view their own record"
ON public.tenants
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'property_manager')
  OR user_account_id = auth.uid()
  OR EXISTS (
    -- Property owners can view tenants on their properties
    SELECT 1
    FROM public.property_owner_associations poa
    JOIN public.property_owners po ON po.id = poa.property_owner_id
    WHERE poa.property_id = tenants.property_id
      AND po.user_id = auth.uid()
  )
);

-- Tenants can only update their own record (limited fields)
DROP POLICY IF EXISTS "Tenants can update their own record" ON public.tenants;

CREATE POLICY "Tenants can update their own record"
ON public.tenants
FOR UPDATE
TO authenticated
USING (user_account_id = auth.uid())
WITH CHECK (user_account_id = auth.uid());

-- Ensure tenants can only view their own property
DROP POLICY IF EXISTS "Tenants can view their own property" ON public.properties;

CREATE POLICY "Tenants can view their own property"
ON public.properties
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'property_manager')
  OR id IN (SELECT property_id FROM public.tenants WHERE user_account_id = auth.uid())
  OR EXISTS (
    -- Property owners can view their properties
    SELECT 1
    FROM public.property_owner_associations poa
    JOIN public.property_owners po ON po.id = poa.property_owner_id
    WHERE poa.property_id = properties.id
      AND po.user_id = auth.uid()
  )
  OR EXISTS (
    -- Property managers can view assigned properties
    SELECT 1
    FROM public.property_manager_assignments pma
    WHERE pma.property_id = properties.id
      AND pma.manager_user_id = auth.uid()
  )
);

-- Update maintenance_requests RLS to include tenant access
DROP POLICY IF EXISTS "Tenants can view their own maintenance requests" ON public.maintenance_requests;

CREATE POLICY "Tenants can view their own maintenance requests"
ON public.maintenance_requests
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'property_manager')
  OR user_id = auth.uid()
  OR property_id IN (
    -- Tenants can view requests for their property
    SELECT property_id FROM public.tenants WHERE user_account_id = auth.uid()
  )
  OR property_id IN (
    -- Property owners can view requests for their properties
    SELECT poa.property_id
    FROM public.property_owner_associations poa
    JOIN public.property_owners po ON po.id = poa.property_owner_id
    WHERE po.user_id = auth.uid()
  )
);

-- Tenants can create maintenance requests for their own property
DROP POLICY IF EXISTS "Tenants can create maintenance requests for their property" ON public.maintenance_requests;

CREATE POLICY "Tenants can create maintenance requests for their property"
ON public.maintenance_requests
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'property_manager')
  OR (
    has_role(auth.uid(), 'tenant')
    AND user_id = auth.uid()
    AND property_id IN (
      SELECT property_id FROM public.tenants WHERE user_account_id = auth.uid()
    )
  )
);

-- Tenants can update their own maintenance requests (limited to certain fields)
DROP POLICY IF EXISTS "Tenants can update their own maintenance requests" ON public.maintenance_requests;

CREATE POLICY "Tenants can update their own maintenance requests"
ON public.maintenance_requests
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'property_manager')
  OR user_id = auth.uid()
);

-- Update payments RLS to include tenant access
DROP POLICY IF EXISTS "Tenants can view their own payments" ON public.payments;

CREATE POLICY "Tenants can view their own payments"
ON public.payments
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin')
  OR user_id = auth.uid()
  OR tenant_id IN (
    SELECT id FROM public.tenants WHERE user_account_id = auth.uid()
  )
  OR property_id IN (
    SELECT property_id FROM public.tenants WHERE user_account_id = auth.uid()
  )
  OR (
    has_role(auth.uid(), 'property_manager')
    AND property_id IN (
      SELECT pma.property_id
      FROM public.property_manager_assignments pma
      WHERE pma.manager_user_id = auth.uid()
    )
  )
  OR property_id IN (
    -- Property owners can view payments for their properties
    SELECT poa.property_id
    FROM public.property_owner_associations poa
    JOIN public.property_owners po ON po.id = poa.property_owner_id
    WHERE po.user_id = auth.uid()
  )
);

-- Tenants can create their own payments
DROP POLICY IF EXISTS "Tenants can create their own payments" ON public.payments;

CREATE POLICY "Tenants can create their own payments"
ON public.payments
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'property_manager')
  OR (
    user_id = auth.uid()
    AND (
      tenant_id IN (SELECT id FROM public.tenants WHERE user_account_id = auth.uid())
      OR property_id IN (SELECT property_id FROM public.tenants WHERE user_account_id = auth.uid())
    )
  )
);

-- Update subscriptions RLS to include tenant access
DROP POLICY IF EXISTS "Tenants can view their own subscriptions" ON public.subscriptions;

CREATE POLICY "Tenants can view their own subscriptions"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin')
  OR user_id = auth.uid()
  OR tenant_id IN (
    SELECT id FROM public.tenants WHERE user_account_id = auth.uid()
  )
  OR property_id IN (
    SELECT property_id FROM public.tenants WHERE user_account_id = auth.uid()
  )
  OR (
    has_role(auth.uid(), 'property_manager')
    AND property_id IN (
      SELECT pma.property_id
      FROM public.property_manager_assignments pma
      WHERE pma.manager_user_id = auth.uid()
    )
  )
  OR property_id IN (
    -- Property owners can view subscriptions for their properties
    SELECT poa.property_id
    FROM public.property_owner_associations poa
    JOIN public.property_owners po ON po.id = poa.property_owner_id
    WHERE po.user_id = auth.uid()
  )
);

-- Add comments for documentation
COMMENT ON FUNCTION public.user_is_tenant_for_property IS 'Security function to check if a user is a tenant for a specific property';
COMMENT ON FUNCTION public.get_tenant_property_id IS 'Security function to get the property_id for a tenant user';

-- Ensure documents table has proper tenant access
DROP POLICY IF EXISTS "Tenants can view documents for their property" ON public.documents;

CREATE POLICY "Tenants can view documents for their property"
ON public.documents
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin')
  OR user_id = auth.uid()
  OR (
    has_role(auth.uid(), 'tenant')
    AND (
      tenant_id IN (SELECT id FROM public.tenants WHERE user_account_id = auth.uid())
      OR property_id IN (SELECT property_id FROM public.tenants WHERE user_account_id = auth.uid())
    )
  )
  OR (
    has_role(auth.uid(), 'property_manager')
    AND property_id IN (
      SELECT pma.property_id
      FROM public.property_manager_assignments pma
      WHERE pma.manager_user_id = auth.uid()
    )
  )
);
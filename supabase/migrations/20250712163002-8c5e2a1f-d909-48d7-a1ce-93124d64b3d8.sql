-- Fix infinite recursion in tenants table RLS policies
-- The issue is likely in the complex tenant policies that reference other tables

-- First, disable RLS temporarily to remove problematic policies
ALTER TABLE public.tenants DISABLE ROW LEVEL SECURITY;

-- Drop all existing tenant policies
DROP POLICY IF EXISTS "Admins can manage all tenants" ON public.tenants;
DROP POLICY IF EXISTS "Property managers can manage all tenants" ON public.tenants;
DROP POLICY IF EXISTS "Property owners can manage tenants in their properties" ON public.tenants;
DROP POLICY IF EXISTS "Tenants can view and update their own record" ON public.tenants;

-- Re-enable RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Create simpler, non-recursive policies
-- 1. Admin access
CREATE POLICY "Admins can manage all tenants"
ON public.tenants
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 2. Property manager access
CREATE POLICY "Property managers can manage all tenants"
ON public.tenants
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'property_manager'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'property_manager'
  )
);

-- 3. Tenant self-access (simplified)
CREATE POLICY "Tenants can manage their own record"
ON public.tenants
FOR ALL
TO authenticated
USING (user_account_id = auth.uid())
WITH CHECK (user_account_id = auth.uid());

-- 4. Property owner access (simplified to avoid complex joins)
CREATE POLICY "Property owners can manage their tenants"
ON public.tenants
FOR ALL
TO authenticated
USING (
  -- Check if the user is the property owner for this tenant's property
  property_id IN (
    SELECT p.id 
    FROM public.properties p
    INNER JOIN public.property_owners po ON po.id = p.owner_id
    WHERE po.user_id = auth.uid()
  )
)
WITH CHECK (
  -- Same check for inserts/updates
  property_id IN (
    SELECT p.id 
    FROM public.properties p
    INNER JOIN public.property_owners po ON po.id = p.owner_id
    WHERE po.user_id = auth.uid()
  )
);

-- Also check maintenance_requests policies that might have similar issues
-- Drop and recreate maintenance_requests policies to prevent recursion

ALTER TABLE public.maintenance_requests DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage all maintenance requests" ON public.maintenance_requests;
DROP POLICY IF EXISTS "Property managers can manage all maintenance requests" ON public.maintenance_requests;
DROP POLICY IF EXISTS "Property owners can manage requests for their properties" ON public.maintenance_requests;
DROP POLICY IF EXISTS "Tenants can create and view requests for their property" ON public.maintenance_requests;

ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;

-- Recreate maintenance request policies without recursion
CREATE POLICY "Admins can manage all maintenance requests"
ON public.maintenance_requests
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Property managers can manage all maintenance requests"
ON public.maintenance_requests
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'property_manager'
  )
);

CREATE POLICY "Property owners can manage their requests"
ON public.maintenance_requests
FOR ALL
TO authenticated
USING (
  property_id IN (
    SELECT p.id 
    FROM public.properties p
    INNER JOIN public.property_owners po ON po.id = p.owner_id
    WHERE po.user_id = auth.uid()
  )
);

CREATE POLICY "Tenants can manage requests for their property"
ON public.maintenance_requests
FOR ALL
TO authenticated
USING (
  property_id IN (
    SELECT t.property_id 
    FROM public.tenants t
    WHERE t.user_account_id = auth.uid()
  )
);
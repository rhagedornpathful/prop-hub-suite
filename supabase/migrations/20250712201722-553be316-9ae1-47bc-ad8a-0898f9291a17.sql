-- Fix infinite recursion in RLS policies

-- Drop existing problematic policies for properties
DROP POLICY IF EXISTS "Property owners can manage their properties" ON public.properties;
DROP POLICY IF EXISTS "Tenants can view their assigned property" ON public.properties;

-- Create corrected policies for properties (avoid recursion)
CREATE POLICY "Property owners can manage their properties"
ON public.properties
FOR ALL
USING (
  owner_id IN (
    SELECT id FROM property_owners WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Tenants can view their assigned property"
ON public.properties
FOR SELECT
USING (
  id IN (
    SELECT property_id FROM tenants WHERE user_account_id = auth.uid()
  )
);

-- Fix tenants policies (avoid recursion)
DROP POLICY IF EXISTS "Property owners can manage their tenants" ON public.tenants;
DROP POLICY IF EXISTS "Tenants can manage their own record" ON public.tenants;

CREATE POLICY "Property owners can manage their tenants"
ON public.tenants
FOR ALL
USING (
  user_id = auth.uid()
)
WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY "Tenants can manage their own record"
ON public.tenants
FOR ALL
USING (user_account_id = auth.uid())
WITH CHECK (user_account_id = auth.uid());
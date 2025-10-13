-- Fix infinite recursion in RLS policies
-- The tenants_select_access policy causes infinite recursion when properties table queries tenants
-- We already have the "Tenants can only view their own record" policy which is sufficient

DROP POLICY IF EXISTS tenants_select_access ON public.tenants;
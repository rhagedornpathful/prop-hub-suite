-- Fix infinite recursion in properties RLS policies
-- The issue: properties_select_access calls user_can_view_property() which creates recursion
-- Solution: Drop the duplicate policy since "Tenants can view their own property" already covers all access

DROP POLICY IF EXISTS properties_select_access ON public.properties;
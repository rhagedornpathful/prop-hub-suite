-- Create helper function to safely check if current user owns the property (avoids recursive RLS in policy)
CREATE OR REPLACE FUNCTION public.user_can_manage_property_associations(_property_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.property_owner_associations poa
    JOIN public.property_owners po ON po.id = poa.property_owner_id
    WHERE poa.property_id = _property_id
      AND po.user_id = auth.uid()
  );
$$;

-- Allow owners to view all associations for their properties
CREATE POLICY "Owners can view associations for their properties"
ON public.property_owner_associations
FOR SELECT
USING (public.user_can_manage_property_associations(property_id));

-- Allow owners to add co-owner associations for their properties
CREATE POLICY "Owners can add associations for their properties"
ON public.property_owner_associations
FOR INSERT
WITH CHECK (public.user_can_manage_property_associations(property_id));

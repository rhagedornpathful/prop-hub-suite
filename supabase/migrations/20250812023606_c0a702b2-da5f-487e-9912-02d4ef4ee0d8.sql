-- RLS improvements for property_owner_associations to ensure owners can see and add co-owner splits
-- Allow owners to view all associations for properties they own (not just their own row)
CREATE POLICY IF NOT EXISTS "Owners can view all associations for their properties"
ON public.property_owner_associations
FOR SELECT
USING (
  property_id IN (
    SELECT poa2.property_id
    FROM public.property_owner_associations poa2
    JOIN public.property_owners po ON po.id = poa2.property_owner_id
    WHERE po.user_id = auth.uid()
  )
);

-- Allow owners to insert associations on properties they already own
CREATE POLICY IF NOT EXISTS "Owners can add associations for their properties"
ON public.property_owner_associations
FOR INSERT
WITH CHECK (
  property_id IN (
    SELECT poa2.property_id
    FROM public.property_owner_associations poa2
    JOIN public.property_owners po ON po.id = poa2.property_owner_id
    WHERE po.user_id = auth.uid()
  )
);

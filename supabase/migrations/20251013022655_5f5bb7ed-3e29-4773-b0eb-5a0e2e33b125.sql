-- Re-run with valid syntax: drop then create policy
DROP POLICY IF EXISTS "Owners can view manager assignments via associations" ON public.property_manager_assignments;

CREATE POLICY "Owners can view manager assignments via associations"
ON public.property_manager_assignments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.property_owner_associations poa
    JOIN public.property_owners po ON po.id = poa.property_owner_id
    WHERE poa.property_id = property_manager_assignments.property_id
      AND po.user_id = auth.uid()
  )
  OR manager_user_id = auth.uid()
  OR public.has_role(auth.uid(), 'property_manager')
);

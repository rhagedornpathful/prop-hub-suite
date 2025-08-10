-- Allow admins to delete profiles so UI deletions persist
CREATE POLICY IF NOT EXISTS "Admins can delete profiles"
ON public.profiles
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
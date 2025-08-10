-- Drop the overly permissive policy for property managers
DROP POLICY IF EXISTS "Property managers can manage all documents" ON public.documents;

-- Create a new policy that restricts property managers to documents for their assigned properties
CREATE POLICY "Property managers can manage documents for their properties" 
ON public.documents 
FOR ALL 
USING (
  has_role(auth.uid(), 'property_manager'::app_role) AND (
    -- Documents they uploaded themselves
    user_id = auth.uid() OR
    -- Documents related to properties they manage
    property_id IN (
      SELECT property_id 
      FROM property_manager_assignments 
      WHERE manager_user_id = auth.uid()
    )
  )
);
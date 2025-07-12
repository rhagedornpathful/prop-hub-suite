-- Add owner_id column to properties table
ALTER TABLE public.properties 
ADD COLUMN owner_id UUID REFERENCES public.property_owners(id) ON DELETE SET NULL;

-- Create index for better performance on owner_id queries
CREATE INDEX idx_properties_owner_id ON public.properties(owner_id);

-- Add a comment to document the relationship
COMMENT ON COLUMN public.properties.owner_id IS 'Foreign key reference to property_owners table';
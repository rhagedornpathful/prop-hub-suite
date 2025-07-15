-- Create junction table for property-owner associations (many-to-many relationship)
CREATE TABLE public.property_owner_associations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  property_owner_id UUID NOT NULL REFERENCES public.property_owners(id) ON DELETE CASCADE,
  ownership_percentage DECIMAL(5,2) CHECK (ownership_percentage > 0 AND ownership_percentage <= 100),
  is_primary_owner BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(property_id, property_owner_id)
);

-- Enable Row Level Security
ALTER TABLE public.property_owner_associations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage all property owner associations" 
ON public.property_owner_associations 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can manage all property owner associations" 
ON public.property_owner_associations 
FOR ALL 
USING (has_role(auth.uid(), 'property_manager'::app_role));

CREATE POLICY "Property owners can manage their associations" 
ON public.property_owner_associations 
FOR ALL 
USING (property_owner_id IN (
  SELECT id FROM public.property_owners WHERE user_id = auth.uid()
));

-- Create indexes for better performance
CREATE INDEX idx_property_owner_associations_property_id ON public.property_owner_associations(property_id);
CREATE INDEX idx_property_owner_associations_property_owner_id ON public.property_owner_associations(property_owner_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_property_owner_associations_updated_at
BEFORE UPDATE ON public.property_owner_associations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing data from properties.owner_id to the new junction table
INSERT INTO public.property_owner_associations (property_id, property_owner_id, is_primary_owner)
SELECT id, owner_id, true
FROM public.properties 
WHERE owner_id IS NOT NULL;

-- Add comment to document the relationship
COMMENT ON TABLE public.property_owner_associations IS 'Junction table for many-to-many relationship between properties and property owners, supporting co-investors';
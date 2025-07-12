-- Create owner_distributions table
CREATE TABLE public.owner_distributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.property_owners(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  distribution_date DATE NOT NULL,
  payment_method TEXT,
  reference_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.owner_distributions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own owner distributions" 
ON public.owner_distributions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.property_owners 
    WHERE property_owners.id = owner_distributions.owner_id 
    AND property_owners.user_id = auth.uid()
  )
);

-- Property managers can view all distributions
CREATE POLICY "Property managers can view all owner distributions" 
ON public.owner_distributions 
FOR SELECT 
USING (has_role(auth.uid(), 'property_manager'::app_role));

-- Admins can manage all distributions
CREATE POLICY "Admins can manage all owner distributions" 
ON public.owner_distributions 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_owner_distributions_updated_at
BEFORE UPDATE ON public.owner_distributions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_owner_distributions_owner_id ON public.owner_distributions(owner_id);
CREATE INDEX idx_owner_distributions_property_id ON public.owner_distributions(property_id);
CREATE INDEX idx_owner_distributions_date ON public.owner_distributions(distribution_date);

-- Add check constraint for positive amounts
ALTER TABLE public.owner_distributions 
ADD CONSTRAINT check_positive_amount CHECK (amount > 0);
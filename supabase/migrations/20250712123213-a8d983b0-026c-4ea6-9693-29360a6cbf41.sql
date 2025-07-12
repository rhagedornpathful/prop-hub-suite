-- Create property_owners table
CREATE TABLE public.property_owners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company_name TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  tax_id_number TEXT,
  bank_account_name TEXT,
  bank_account_number TEXT,
  bank_routing_number TEXT,
  preferred_payment_method TEXT CHECK (preferred_payment_method IN ('check', 'direct_deposit', 'other')) DEFAULT 'check',
  is_self BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.property_owners ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own property owners" 
ON public.property_owners 
FOR ALL 
USING (auth.uid() = user_id);

-- Property managers can view all property owners
CREATE POLICY "Property managers can view all property owners" 
ON public.property_owners 
FOR SELECT 
USING (has_role(auth.uid(), 'property_manager'::app_role));

-- Admins can manage all property owners
CREATE POLICY "Admins can manage all property owners" 
ON public.property_owners 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_property_owners_updated_at
BEFORE UPDATE ON public.property_owners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for better performance on user_id queries
CREATE INDEX idx_property_owners_user_id ON public.property_owners(user_id);

-- Add index for email searches
CREATE INDEX idx_property_owners_email ON public.property_owners(email);

-- Add constraint to ensure only one is_self=true per user
CREATE UNIQUE INDEX idx_property_owners_is_self_unique 
ON public.property_owners(user_id) 
WHERE is_self = true;
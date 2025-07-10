-- Create properties table
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  street_address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  property_type TEXT,
  bedrooms INTEGER,
  bathrooms DECIMAL,
  square_feet INTEGER,
  lot_size TEXT,
  year_built INTEGER,
  estimated_value DECIMAL,
  monthly_rent DECIMAL,
  description TEXT,
  amenities TEXT[],
  images TEXT[],
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on properties table
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- RLS policies for properties
CREATE POLICY "Users can view their own properties" 
ON public.properties 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own properties" 
ON public.properties 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own properties" 
ON public.properties 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own properties" 
ON public.properties 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on properties
CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
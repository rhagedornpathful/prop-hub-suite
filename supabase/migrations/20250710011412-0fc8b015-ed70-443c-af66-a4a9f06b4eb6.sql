-- Create house_watching table
CREATE TABLE public.house_watching (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_address TEXT NOT NULL,
  owner_name TEXT,
  owner_contact TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  check_frequency TEXT DEFAULT 'weekly',
  notes TEXT,
  status TEXT DEFAULT 'active',
  last_check_date DATE,
  next_check_date DATE,
  monthly_fee DECIMAL,
  key_location TEXT,
  emergency_contact TEXT,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on house_watching table
ALTER TABLE public.house_watching ENABLE ROW LEVEL SECURITY;

-- RLS policies for house_watching
CREATE POLICY "Users can view their own house watching properties" 
ON public.house_watching 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own house watching properties" 
ON public.house_watching 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own house watching properties" 
ON public.house_watching 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own house watching properties" 
ON public.house_watching 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on house_watching
CREATE TRIGGER update_house_watching_updated_at
BEFORE UPDATE ON public.house_watching
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
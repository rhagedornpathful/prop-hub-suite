-- Create property check sessions table
CREATE TABLE public.property_check_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  property_id TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  checklist_data JSONB,
  general_notes TEXT,
  location_verified BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'in_progress',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.property_check_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for property check sessions
CREATE POLICY "Users can manage their own property check sessions" 
ON public.property_check_sessions 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all property check sessions" 
ON public.property_check_sessions 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can manage all property check sessions" 
ON public.property_check_sessions 
FOR ALL 
USING (has_role(auth.uid(), 'property_manager'::app_role));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_property_check_sessions_updated_at
BEFORE UPDATE ON public.property_check_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
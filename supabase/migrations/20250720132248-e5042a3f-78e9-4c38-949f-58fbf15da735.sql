-- Create home_check_sessions table for House Watchers
CREATE TABLE public.home_check_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  property_id TEXT NOT NULL,
  weather TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  checklist_data JSONB,
  general_notes TEXT,
  duration_minutes INTEGER,
  status TEXT NOT NULL DEFAULT 'in_progress',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  scheduled_date DATE,
  scheduled_time TIME WITHOUT TIME ZONE,
  scheduled_by UUID,
  total_issues_found INTEGER DEFAULT 0,
  photos_taken INTEGER DEFAULT 0,
  overall_condition TEXT,
  weather_impact TEXT,
  next_visit_date DATE
);

-- Enable RLS
ALTER TABLE public.home_check_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for home_check_sessions
CREATE POLICY "Admins can manage all home check sessions" 
ON public.home_check_sessions 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "House watchers can manage their home check sessions" 
ON public.home_check_sessions 
FOR ALL 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_home_check_sessions_updated_at
BEFORE UPDATE ON public.home_check_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create home_check_activities table for tracking activities
CREATE TABLE public.home_check_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  activity_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.home_check_activities ENABLE ROW LEVEL SECURITY;

-- Create policies for home_check_activities
CREATE POLICY "Admins can manage all home check activities" 
ON public.home_check_activities 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "House watchers can manage their home check activities" 
ON public.home_check_activities 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
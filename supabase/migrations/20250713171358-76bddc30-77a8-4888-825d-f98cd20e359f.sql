-- Create a table to track property check activities/events
CREATE TABLE public.property_check_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.property_check_sessions(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'started', 'submitted', 'auto_saved', 'item_completed', etc.
  activity_data JSONB, -- Additional data like which item was completed, notes, etc.
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.property_check_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own property check activities"
  ON public.property_check_activities
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all property check activities"
  ON public.property_check_activities
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can manage all property check activities"
  ON public.property_check_activities
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'property_manager'::app_role))
  WITH CHECK (has_role(auth.uid(), 'property_manager'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_property_check_activities_updated_at
  BEFORE UPDATE ON public.property_check_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add an index for better performance
CREATE INDEX idx_property_check_activities_session_id ON public.property_check_activities(session_id);
CREATE INDEX idx_property_check_activities_user_id ON public.property_check_activities(user_id);
CREATE INDEX idx_property_check_activities_type ON public.property_check_activities(activity_type);
-- Create house_watcher_settings table for storing user preferences
CREATE TABLE public.house_watcher_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  push_notifications BOOLEAN NOT NULL DEFAULT false,
  home_check_notifications BOOLEAN NOT NULL DEFAULT true,
  schedule_change_notifications BOOLEAN NOT NULL DEFAULT true,
  reminder_notifications BOOLEAN NOT NULL DEFAULT true,
  preferred_contact_time TEXT,
  preferred_contact_method TEXT DEFAULT 'email',
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.house_watcher_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own settings" 
ON public.house_watcher_settings 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can view all settings
CREATE POLICY "Admins can view all house watcher settings" 
ON public.house_watcher_settings 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_house_watcher_settings_updated_at
BEFORE UPDATE ON public.house_watcher_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
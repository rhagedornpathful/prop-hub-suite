-- Add user_account_id to property_owners table
ALTER TABLE public.property_owners 
ADD COLUMN user_account_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add user_account_id to tenants table
ALTER TABLE public.tenants 
ADD COLUMN user_account_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create house_watchers table
CREATE TABLE public.house_watchers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create house_watcher_properties table for many-to-many relationship
CREATE TABLE public.house_watcher_properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  house_watcher_id UUID NOT NULL REFERENCES public.house_watchers(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  assigned_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  UNIQUE(house_watcher_id, property_id)
);

-- Enable RLS on house_watchers table
ALTER TABLE public.house_watchers ENABLE ROW LEVEL SECURITY;

-- Enable RLS on house_watcher_properties table
ALTER TABLE public.house_watcher_properties ENABLE ROW LEVEL SECURITY;

-- RLS policies for house_watchers
CREATE POLICY "House watchers can view their own record" 
ON public.house_watchers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all house watchers" 
ON public.house_watchers 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can manage house watchers" 
ON public.house_watchers 
FOR ALL 
USING (has_role(auth.uid(), 'property_manager'::app_role));

-- RLS policies for house_watcher_properties
CREATE POLICY "House watchers can view their assigned properties" 
ON public.house_watcher_properties 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.house_watchers 
    WHERE house_watchers.id = house_watcher_properties.house_watcher_id 
    AND house_watchers.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage house watcher property assignments" 
ON public.house_watcher_properties 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can manage house watcher property assignments" 
ON public.house_watcher_properties 
FOR ALL 
USING (has_role(auth.uid(), 'property_manager'::app_role));
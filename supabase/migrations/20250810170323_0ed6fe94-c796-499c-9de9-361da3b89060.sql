-- Create property_service_assignments table
CREATE TABLE public.property_service_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL,
  monthly_fee NUMERIC NOT NULL DEFAULT 0,
  rent_percentage NUMERIC NOT NULL DEFAULT 0,
  billing_start_date DATE NOT NULL,
  billing_end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.property_service_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for property_service_assignments
CREATE POLICY "Admins can manage all property service assignments" 
ON public.property_service_assignments 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

CREATE POLICY "Property managers can manage all property service assignments" 
ON public.property_service_assignments 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'property_manager'::app_role
  )
);

CREATE POLICY "Property owners can manage their property assignments" 
ON public.property_service_assignments 
FOR ALL 
USING (
  property_id IN (
    SELECT p.id 
    FROM properties p 
    JOIN property_owners po ON po.id = p.owner_id 
    WHERE po.user_id = auth.uid()
  )
);

-- Create subscribers table for Stripe billing
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subscribers
CREATE POLICY "Users can view their own subscription" 
ON public.subscribers 
FOR SELECT 
USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "Users can update their own subscription" 
ON public.subscribers 
FOR UPDATE 
USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "Edge functions can insert subscriptions" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Edge functions can update subscriptions" 
ON public.subscribers 
FOR UPDATE 
USING (true);

-- Add updated_at trigger for property_service_assignments
CREATE TRIGGER update_property_service_assignments_updated_at
  BEFORE UPDATE ON public.property_service_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for subscribers
CREATE TRIGGER update_subscribers_updated_at
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
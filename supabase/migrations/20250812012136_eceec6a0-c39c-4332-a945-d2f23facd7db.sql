-- Create property service assignments table
CREATE TABLE public.property_service_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL,
  service_id UUID NOT NULL,
  assigned_by UUID NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  effective_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled', 'expired')),
  monthly_fee NUMERIC NOT NULL DEFAULT 0,
  custom_frequency TEXT, -- Override service default frequency if needed
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(property_id, service_id, effective_start_date)
);

-- Create scheduled property checks table for automated recurring checks
CREATE TABLE public.scheduled_property_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_service_assignment_id UUID NOT NULL,
  property_id UUID NOT NULL,
  assigned_house_watcher_id UUID,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  check_frequency TEXT NOT NULL, -- 'weekly', 'bi-weekly', 'monthly', 'quarterly'
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled')),
  check_session_id UUID, -- Links to actual check session when performed
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID,
  rescheduled_from_date DATE,
  rescheduled_reason TEXT,
  auto_generated BOOLEAN NOT NULL DEFAULT true,
  special_instructions TEXT,
  weather_dependent BOOLEAN DEFAULT false,
  estimated_duration_minutes INTEGER DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create house watcher property assignments for easier management
CREATE TABLE public.house_watcher_properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  house_watcher_id UUID NOT NULL,
  property_id UUID NOT NULL,
  assigned_by UUID NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  notes TEXT,
  preferred_check_time TIME,
  key_access_notes TEXT,
  emergency_contact_override TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(house_watcher_id, property_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.property_service_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_property_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.house_watcher_properties ENABLE ROW LEVEL SECURITY;

-- RLS Policies for property_service_assignments
CREATE POLICY "Admins can manage all property service assignments"
ON public.property_service_assignments FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can manage property service assignments"
ON public.property_service_assignments FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'property_manager'::app_role));

CREATE POLICY "Property owners can view their property service assignments"
ON public.property_service_assignments FOR SELECT
TO authenticated
USING (
  property_id IN (
    SELECT p.id FROM properties p
    JOIN property_owner_associations poa ON poa.property_id = p.id
    JOIN property_owners po ON po.id = poa.property_owner_id
    WHERE po.user_id = auth.uid()
  )
);

-- RLS Policies for scheduled_property_checks
CREATE POLICY "Admins can manage all scheduled checks"
ON public.scheduled_property_checks FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can manage scheduled checks"
ON public.scheduled_property_checks FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'property_manager'::app_role));

CREATE POLICY "House watchers can view and update their assigned checks"
ON public.scheduled_property_checks FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'house_watcher'::app_role) AND 
  (assigned_house_watcher_id = auth.uid() OR assigned_house_watcher_id IS NULL)
);

CREATE POLICY "Property owners can view scheduled checks for their properties"
ON public.scheduled_property_checks FOR SELECT
TO authenticated
USING (
  property_id IN (
    SELECT p.id FROM properties p
    JOIN property_owner_associations poa ON poa.property_id = p.id
    JOIN property_owners po ON po.id = poa.property_owner_id
    WHERE po.user_id = auth.uid()
  )
);

-- RLS Policies for house_watcher_properties
CREATE POLICY "Admins can manage all house watcher property assignments"
ON public.house_watcher_properties FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can manage house watcher assignments"
ON public.house_watcher_properties FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'property_manager'::app_role));

CREATE POLICY "House watchers can view their property assignments"
ON public.house_watcher_properties FOR SELECT
TO authenticated
USING (
  house_watcher_id IN (
    SELECT hw.id FROM house_watchers hw WHERE hw.user_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX idx_property_service_assignments_property_id ON public.property_service_assignments(property_id);
CREATE INDEX idx_property_service_assignments_service_id ON public.property_service_assignments(service_id);
CREATE INDEX idx_property_service_assignments_status ON public.property_service_assignments(status);

CREATE INDEX idx_scheduled_property_checks_property_id ON public.scheduled_property_checks(property_id);
CREATE INDEX idx_scheduled_property_checks_scheduled_date ON public.scheduled_property_checks(scheduled_date);
CREATE INDEX idx_scheduled_property_checks_status ON public.scheduled_property_checks(status);
CREATE INDEX idx_scheduled_property_checks_house_watcher ON public.scheduled_property_checks(assigned_house_watcher_id);

CREATE INDEX idx_house_watcher_properties_house_watcher ON public.house_watcher_properties(house_watcher_id);
CREATE INDEX idx_house_watcher_properties_property ON public.house_watcher_properties(property_id);

-- Function to automatically generate next scheduled check based on frequency
CREATE OR REPLACE FUNCTION public.generate_next_scheduled_check(
  assignment_id UUID,
  current_date DATE DEFAULT CURRENT_DATE
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  v_property_id UUID;
  v_service_id UUID;
  v_frequency TEXT;
  v_next_date DATE;
  v_new_check_id UUID;
  v_house_watcher_id UUID;
BEGIN
  -- Get assignment details
  SELECT 
    psa.property_id, 
    psa.service_id,
    COALESCE(psa.custom_frequency, s.billing_type) as frequency
  INTO v_property_id, v_service_id, v_frequency
  FROM property_service_assignments psa
  JOIN services s ON s.id = psa.service_id
  WHERE psa.id = assignment_id AND psa.status = 'active';
  
  IF v_property_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Calculate next check date based on frequency
  CASE v_frequency
    WHEN 'weekly' THEN
      v_next_date := current_date + INTERVAL '7 days';
    WHEN 'bi-weekly' THEN
      v_next_date := current_date + INTERVAL '14 days';
    WHEN 'monthly' THEN
      v_next_date := current_date + INTERVAL '1 month';
    WHEN 'quarterly' THEN
      v_next_date := current_date + INTERVAL '3 months';
    ELSE
      v_next_date := current_date + INTERVAL '1 month'; -- Default
  END CASE;
  
  -- Get assigned house watcher for this property
  SELECT house_watcher_id 
  INTO v_house_watcher_id
  FROM house_watcher_properties 
  WHERE property_id = v_property_id AND status = 'active'
  LIMIT 1;
  
  -- Create next scheduled check
  INSERT INTO scheduled_property_checks (
    property_service_assignment_id,
    property_id,
    assigned_house_watcher_id,
    scheduled_date,
    check_frequency,
    auto_generated
  ) VALUES (
    assignment_id,
    v_property_id,
    v_house_watcher_id,
    v_next_date,
    v_frequency,
    true
  ) RETURNING id INTO v_new_check_id;
  
  RETURN v_new_check_id;
END;
$$;

-- Function to complete a check and generate the next one
CREATE OR REPLACE FUNCTION public.complete_scheduled_check(
  check_id UUID,
  session_id UUID DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  v_assignment_id UUID;
BEGIN
  -- Update the completed check
  UPDATE scheduled_property_checks 
  SET 
    status = 'completed',
    completed_at = now(),
    completed_by = auth.uid(),
    check_session_id = session_id,
    updated_at = now()
  WHERE id = check_id
  RETURNING property_service_assignment_id INTO v_assignment_id;
  
  IF v_assignment_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Generate next scheduled check
  PERFORM generate_next_scheduled_check(v_assignment_id);
  
  RETURN TRUE;
END;
$$;

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_property_service_assignments_updated_at
  BEFORE UPDATE ON public.property_service_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scheduled_property_checks_updated_at
  BEFORE UPDATE ON public.scheduled_property_checks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_house_watcher_properties_updated_at
  BEFORE UPDATE ON public.house_watcher_properties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
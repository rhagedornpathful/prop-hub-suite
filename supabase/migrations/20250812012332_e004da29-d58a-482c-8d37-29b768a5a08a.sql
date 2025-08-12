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
-- Add new columns to maintenance_requests table for enhanced scheduling and tracking
ALTER TABLE public.maintenance_requests 
ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS assigned_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS started_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS cancelled_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS due_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS completion_notes text,
ADD COLUMN IF NOT EXISTS actual_cost numeric,
ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS recurrence_interval text,
ADD COLUMN IF NOT EXISTS parent_request_id uuid REFERENCES maintenance_requests(id);

-- Create maintenance_status_history table to track status changes
CREATE TABLE IF NOT EXISTS public.maintenance_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  maintenance_request_id uuid NOT NULL REFERENCES maintenance_requests(id) ON DELETE CASCADE,
  old_status text,
  new_status text NOT NULL,
  changed_by uuid NOT NULL REFERENCES auth.users(id),
  changed_at timestamp with time zone NOT NULL DEFAULT now(),
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on maintenance_status_history
ALTER TABLE public.maintenance_status_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for maintenance_status_history
CREATE POLICY "Admins can manage all maintenance status history" ON public.maintenance_status_history
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can manage all maintenance status history" ON public.maintenance_status_history
FOR ALL USING (has_role(auth.uid(), 'property_manager'::app_role));

CREATE POLICY "Users can view maintenance status history for their requests" ON public.maintenance_status_history
FOR SELECT USING (
  maintenance_request_id IN (
    SELECT id FROM maintenance_requests 
    WHERE user_id = auth.uid() OR assigned_to = auth.uid()
  )
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_assigned_to ON public.maintenance_requests(assigned_to);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_due_date ON public.maintenance_requests(due_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status_priority ON public.maintenance_requests(status, priority);
CREATE INDEX IF NOT EXISTS idx_maintenance_status_history_request_id ON public.maintenance_status_history(maintenance_request_id);

-- Update existing RLS policies to include assigned users
CREATE POLICY IF NOT EXISTS "Users can view requests assigned to them" ON public.maintenance_requests
FOR SELECT USING (assigned_to = auth.uid());

CREATE POLICY IF NOT EXISTS "Assigned users can update their requests" ON public.maintenance_requests
FOR UPDATE USING (assigned_to = auth.uid());
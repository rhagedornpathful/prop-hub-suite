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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage all status history" ON public.maintenance_status_history;
DROP POLICY IF EXISTS "Property managers can manage all status history" ON public.maintenance_status_history;
DROP POLICY IF EXISTS "Users can view status history for their requests" ON public.maintenance_status_history;

-- Create RLS policies for maintenance_status_history
CREATE POLICY "Admins can manage all status history" ON public.maintenance_status_history
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can manage all status history" ON public.maintenance_status_history
FOR ALL USING (has_role(auth.uid(), 'property_manager'::app_role));

CREATE POLICY "Users can view status history for their requests" ON public.maintenance_status_history
FOR SELECT USING (
  maintenance_request_id IN (
    SELECT id FROM maintenance_requests 
    WHERE user_id = auth.uid() OR assigned_to = auth.uid()
  )
);

-- Function to automatically track status changes
CREATE OR REPLACE FUNCTION public.track_maintenance_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only track if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.maintenance_status_history (
      maintenance_request_id,
      old_status,
      new_status,
      changed_by,
      notes
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      auth.uid(),
      CASE 
        WHEN NEW.status = 'in-progress' AND OLD.status = 'scheduled' THEN 'Work started'
        WHEN NEW.status = 'completed' THEN 'Work completed'
        WHEN NEW.status = 'cancelled' THEN 'Request cancelled'
        ELSE 'Status updated'
      END
    );
    
    -- Update timestamp columns based on status
    IF NEW.status = 'in-progress' AND OLD.status != 'in-progress' THEN
      NEW.started_at = now();
    ELSIF NEW.status = 'completed' AND OLD.status != 'completed' THEN
      NEW.completed_at = now();
    ELSIF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
      NEW.cancelled_at = now();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for status tracking
DROP TRIGGER IF EXISTS track_maintenance_status_trigger ON public.maintenance_requests;
CREATE TRIGGER track_maintenance_status_trigger
  BEFORE UPDATE ON public.maintenance_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.track_maintenance_status_change();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_assigned_to ON public.maintenance_requests(assigned_to);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_due_date ON public.maintenance_requests(due_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status_priority ON public.maintenance_requests(status, priority);
CREATE INDEX IF NOT EXISTS idx_maintenance_status_history_request_id ON public.maintenance_status_history(maintenance_request_id);

-- Create a view for calendar events
CREATE OR REPLACE VIEW public.maintenance_calendar_events AS
SELECT 
  mr.id,
  mr.title,
  mr.description,
  mr.status,
  mr.priority,
  mr.scheduled_date,
  mr.due_date,
  mr.assigned_to,
  mr.property_id,
  p.address as property_address,
  profiles.first_name || ' ' || profiles.last_name as assigned_to_name
FROM maintenance_requests mr
LEFT JOIN properties p ON mr.property_id = p.id
LEFT JOIN profiles ON mr.assigned_to = profiles.user_id
WHERE mr.scheduled_date IS NOT NULL OR mr.due_date IS NOT NULL;

-- Update existing RLS policies to include assigned users
DROP POLICY IF EXISTS "Users can view requests assigned to them" ON public.maintenance_requests;
CREATE POLICY "Users can view requests assigned to them" ON public.maintenance_requests
FOR SELECT USING (assigned_to = auth.uid());

DROP POLICY IF EXISTS "Assigned users can update their requests" ON public.maintenance_requests;
CREATE POLICY "Assigned users can update their requests" ON public.maintenance_requests
FOR UPDATE USING (assigned_to = auth.uid());
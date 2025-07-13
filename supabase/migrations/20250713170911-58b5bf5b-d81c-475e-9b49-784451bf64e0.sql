-- Add scheduling functionality to property_check_sessions table
ALTER TABLE public.property_check_sessions 
ADD COLUMN scheduled_date DATE,
ADD COLUMN scheduled_time TIME,
ADD COLUMN scheduled_by UUID REFERENCES auth.users(id);

-- Update started_at to be nullable for scheduled checks
ALTER TABLE public.property_check_sessions 
ALTER COLUMN started_at DROP NOT NULL;

-- Add a constraint to ensure either it's scheduled OR started
ALTER TABLE public.property_check_sessions 
ADD CONSTRAINT check_scheduled_or_started 
CHECK (
  (scheduled_date IS NOT NULL AND scheduled_time IS NOT NULL AND started_at IS NULL) OR
  (scheduled_date IS NULL AND scheduled_time IS NULL AND started_at IS NOT NULL) OR
  (scheduled_date IS NOT NULL AND scheduled_time IS NOT NULL AND started_at IS NOT NULL)
);

-- Update the status to include 'scheduled' as a valid option
-- Note: This is just documentation as PostgreSQL doesn't enforce CHECK constraints on text fields the same way
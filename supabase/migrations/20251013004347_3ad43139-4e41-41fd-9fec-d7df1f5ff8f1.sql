-- Create check_type enum
CREATE TYPE public.check_type AS ENUM ('quick', 'full');

-- Add check_type to check_templates table
ALTER TABLE public.check_templates 
  ADD COLUMN check_type public.check_type NOT NULL DEFAULT 'full';

-- Add check_type to property_check_sessions table  
ALTER TABLE public.property_check_sessions
  ADD COLUMN check_type public.check_type NOT NULL DEFAULT 'full';

-- Add check_type to home_check_sessions table (for consistency)
ALTER TABLE public.home_check_sessions
  ADD COLUMN check_type public.check_type NOT NULL DEFAULT 'full';

-- Add index for filtering by check_type
CREATE INDEX idx_check_templates_check_type ON public.check_templates(check_type);
CREATE INDEX idx_property_check_sessions_check_type ON public.property_check_sessions(check_type);
CREATE INDEX idx_home_check_sessions_check_type ON public.home_check_sessions(check_type);

-- Add comments for documentation
COMMENT ON COLUMN public.check_templates.check_type IS 'Type of check: quick (5-10 multiple choice questions) or full (detailed sectioned checklist)';
COMMENT ON COLUMN public.property_check_sessions.check_type IS 'Type of check performed: quick or full';
COMMENT ON COLUMN public.home_check_sessions.check_type IS 'Type of check performed: quick or full';
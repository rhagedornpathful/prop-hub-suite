-- Add status column to property_owners for archiving
ALTER TABLE public.property_owners
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

-- Optional: create an index to filter by status efficiently
CREATE INDEX IF NOT EXISTS idx_property_owners_status ON public.property_owners (status);

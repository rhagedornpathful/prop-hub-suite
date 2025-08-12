-- 1) Add owner approval fields to maintenance_requests
ALTER TABLE public.maintenance_requests
ADD COLUMN IF NOT EXISTS owner_approval_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS owner_approval_by uuid,
ADD COLUMN IF NOT EXISTS owner_approval_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS owner_approval_notes text;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_owner_approval_status ON public.maintenance_requests(owner_approval_status);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_property_id ON public.maintenance_requests(property_id);

-- 2) Allow property owners to view check sessions (home_check_sessions and property_check_sessions) for their properties
-- Note: property_id is stored as text in these tables, so we cast to uuid for comparison

-- home_check_sessions: Owner SELECT policy
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'home_check_sessions' 
      AND policyname = 'Property owners can view home check sessions for their properties'
  ) THEN
    CREATE POLICY "Property owners can view home check sessions for their properties"
    ON public.home_check_sessions
    FOR SELECT
    USING (
      (property_id::uuid) IN (
        SELECT p.id
        FROM public.properties p
        JOIN public.property_owners po ON po.id = p.owner_id
        WHERE po.user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- property_check_sessions: Owner SELECT policy
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'property_check_sessions' 
      AND policyname = 'Property owners can view property check sessions for their properties'
  ) THEN
    CREATE POLICY "Property owners can view property check sessions for their properties"
    ON public.property_check_sessions
    FOR SELECT
    USING (
      (property_id::uuid) IN (
        SELECT p.id
        FROM public.properties p
        JOIN public.property_owners po ON po.id = p.owner_id
        WHERE po.user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- 3) Optional: constrain owner approval updates to only approval fields (without removing existing broader owner policies)
-- This policy is permissive alongside existing ones; it ensures owners at least can update approval fields.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'maintenance_requests' 
      AND policyname = 'Property owners can update approval fields on their requests'
  ) THEN
    CREATE POLICY "Property owners can update approval fields on their requests"
    ON public.maintenance_requests
    FOR UPDATE
    USING (
      (property_id IN (
        SELECT p.id
        FROM public.properties p
        JOIN public.property_owners po ON po.id = p.owner_id
        WHERE po.user_id = auth.uid()
      ))
    )
    WITH CHECK (
      (property_id IN (
        SELECT p.id
        FROM public.properties p
        JOIN public.property_owners po ON po.id = p.owner_id
        WHERE po.user_id = auth.uid()
      ))
    );
  END IF;
END $$;

-- 4) Trigger to auto-stamp owner_approval_by/at when status changes
CREATE OR REPLACE FUNCTION public.set_owner_approval_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.owner_approval_status IS DISTINCT FROM OLD.owner_approval_status THEN
      NEW.owner_approval_by := COALESCE(NEW.owner_approval_by, auth.uid());
      NEW.owner_approval_at := COALESCE(NEW.owner_approval_at, now());
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_owner_approval_audit ON public.maintenance_requests;
CREATE TRIGGER trg_set_owner_approval_audit
BEFORE UPDATE ON public.maintenance_requests
FOR EACH ROW
EXECUTE FUNCTION public.set_owner_approval_audit();
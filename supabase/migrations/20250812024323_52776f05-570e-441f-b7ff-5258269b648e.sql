-- PR1 DB hardening for ownership management

-- 1) Ensure each owner appears once per property
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_property_owner_pair
ON public.property_owner_associations(property_id, property_owner_id);

-- 2) Ensure at most one primary owner per property
CREATE UNIQUE INDEX IF NOT EXISTS idx_property_primary_owner_once
ON public.property_owner_associations(property_id)
WHERE is_primary_owner = true;

-- 3) Validate total ownership percentage <= 100 per property
CREATE OR REPLACE FUNCTION public.validate_total_ownership()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_existing_total numeric := 0;
  v_new numeric := COALESCE(NEW.ownership_percentage, 0);
BEGIN
  -- Sum existing ownership for the same property, excluding current row on update
  SELECT COALESCE(SUM(COALESCE(ownership_percentage, 0)), 0)
    INTO v_existing_total
  FROM public.property_owner_associations
  WHERE property_id = NEW.property_id
    AND (TG_OP = 'INSERT' OR id <> NEW.id);

  IF (v_existing_total + v_new) > 100 THEN
    RAISE EXCEPTION 'Total ownership percentage (%%) cannot exceed 100 for property %', v_existing_total + v_new, NEW.property_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_total_ownership ON public.property_owner_associations;
CREATE TRIGGER trg_validate_total_ownership
BEFORE INSERT OR UPDATE ON public.property_owner_associations
FOR EACH ROW
EXECUTE FUNCTION public.validate_total_ownership();

-- 4) Helpful indexes for performance
CREATE INDEX IF NOT EXISTS idx_poa_property_id ON public.property_owner_associations(property_id);
CREATE INDEX IF NOT EXISTS idx_poa_owner_id ON public.property_owner_associations(property_owner_id);
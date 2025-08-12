-- Fix RAISE formatting in validate_total_ownership
CREATE OR REPLACE FUNCTION public.validate_total_ownership()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_existing_total numeric := 0;
  v_new numeric := COALESCE(NEW.ownership_percentage, 0);
  v_total numeric := 0;
BEGIN
  SELECT COALESCE(SUM(COALESCE(ownership_percentage, 0)), 0)
    INTO v_existing_total
  FROM public.property_owner_associations
  WHERE property_id = NEW.property_id
    AND (TG_OP = 'INSERT' OR id <> NEW.id);

  v_total := v_existing_total + v_new;

  IF v_total > 100 THEN
    RAISE EXCEPTION USING MESSAGE = 'Total ownership percentage ' || v_total::text || ' exceeds 100 for property ' || NEW.property_id::text;
  END IF;

  RETURN NEW;
END;
$$;
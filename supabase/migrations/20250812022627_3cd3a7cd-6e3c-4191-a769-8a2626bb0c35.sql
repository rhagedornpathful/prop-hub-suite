-- Functions and triggers to auto-schedule house checks when packages are activated
-- and when checks complete. Also schedules initial check for Essential package.

-- 1) Helper: calculate next check date based on frequency
CREATE OR REPLACE FUNCTION public.calculate_next_check_date(_from date, _frequency text)
RETURNS date
LANGUAGE sql
STABLE
AS $$
  SELECT (
    CASE lower(coalesce(_frequency, 'monthly'))
      WHEN 'weekly' THEN (_from + INTERVAL '7 days')
      WHEN 'biweekly' THEN (_from + INTERVAL '14 days')
      WHEN 'monthly' THEN (_from + INTERVAL '30 days')
      WHEN 'quarterly' THEN (_from + INTERVAL '90 days')
      ELSE (_from + INTERVAL '30 days')
    END
  )::date;
$$;

-- 2) Core scheduler: create a scheduled home_check_session for a property
CREATE OR REPLACE FUNCTION public.schedule_home_watch_session(_property_id uuid, _frequency text, _scheduled_by uuid DEFAULT auth.uid())
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_prop RECORD;
  v_hw RECORD;
  v_next_date date;
  v_existing uuid;
  v_new_id uuid;
BEGIN
  -- Load property
  SELECT id, address INTO v_prop FROM public.properties WHERE id = _property_id LIMIT 1;
  IF v_prop.id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Find active house watching assignment by matching address
  SELECT * INTO v_hw
  FROM public.house_watching hw
  WHERE lower(trim(hw.property_address)) = lower(trim(v_prop.address))
    AND coalesce(hw.status, 'active') = 'active'
  LIMIT 1;

  IF v_hw.id IS NULL THEN
    -- No active house watching record, nothing to schedule
    RETURN NULL;
  END IF;

  -- Determine next date
  v_next_date := COALESCE(v_hw.next_check_date, public.calculate_next_check_date(CURRENT_DATE, COALESCE(v_hw.check_frequency, _frequency)));

  -- Avoid duplicates
  SELECT id INTO v_existing
  FROM public.home_check_sessions
  WHERE property_id = _property_id::text
    AND scheduled_date = v_next_date
    AND user_id = v_hw.user_id
    AND status = 'scheduled'
  LIMIT 1;

  IF v_existing IS NOT NULL THEN
    RETURN v_existing;
  END IF;

  -- Insert scheduled session
  INSERT INTO public.home_check_sessions (
    user_id, property_id, scheduled_date, scheduled_by, status, checklist_data
  ) VALUES (
    v_hw.user_id, _property_id::text, v_next_date, _scheduled_by, 'scheduled', '{"auto": true}'::jsonb
  ) RETURNING id INTO v_new_id;

  -- If next_check_date was null, update it to the scheduled date
  IF v_hw.next_check_date IS NULL THEN
    UPDATE public.house_watching SET next_check_date = v_next_date, updated_at = now()
    WHERE id = v_hw.id;
  END IF;

  RETURN v_new_id;
END;
$$;

-- 3) Trigger on property_service_assignments to schedule when package becomes active
CREATE OR REPLACE FUNCTION public.on_property_service_activation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_service RECORD;
  v_freq text;
BEGIN
  -- Only act on active status
  IF (TG_OP = 'INSERT' AND NEW.status = 'active') OR (TG_OP = 'UPDATE' AND NEW.status = 'active' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    SELECT id, category, package_tier INTO v_service FROM public.services WHERE id = NEW.service_id;
    IF v_service.id IS NULL OR v_service.category != 'house_watching' THEN
      RETURN NEW;
    END IF;

    -- Map package tier to frequency
    v_freq := CASE COALESCE(v_service.package_tier, 'essential')
      WHEN 'essential' THEN 'monthly'
      WHEN 'premier' THEN 'biweekly'
      WHEN 'platinum' THEN 'weekly'
      ELSE 'monthly'
    END;

    PERFORM public.schedule_home_watch_session(NEW.property_id, v_freq, NEW.assigned_by);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_property_service_activation ON public.property_service_assignments;
CREATE TRIGGER trg_on_property_service_activation
AFTER INSERT OR UPDATE OF status ON public.property_service_assignments
FOR EACH ROW
EXECUTE FUNCTION public.on_property_service_activation();

-- 4) When a check is completed, roll forward next_check_date and create the next scheduled session
CREATE OR REPLACE FUNCTION public.on_home_check_completed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_prop RECORD;
  v_hw RECORD;
  v_basis date;
  v_next date;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    -- Load property to match with house_watching
    SELECT id, address INTO v_prop FROM public.properties WHERE id = NEW.property_id::uuid LIMIT 1;

    -- Find matching house_watching by address and user
    SELECT * INTO v_hw FROM public.house_watching hw
    WHERE lower(trim(hw.property_address)) = lower(trim(v_prop.address))
      AND hw.user_id = NEW.user_id
    LIMIT 1;

    IF v_hw.id IS NOT NULL THEN
      v_basis := COALESCE(NEW.scheduled_date, CURRENT_DATE);
      v_next := public.calculate_next_check_date(v_basis, COALESCE(v_hw.check_frequency, 'monthly'));

      -- Update last/next dates
      UPDATE public.house_watching
      SET last_check_date = v_basis,
          next_check_date = v_next,
          updated_at = now()
      WHERE id = v_hw.id;

      -- Schedule the next session
      PERFORM public.schedule_home_watch_session(v_prop.id, COALESCE(v_hw.check_frequency, 'monthly'), NEW.user_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_home_check_completed ON public.home_check_sessions;
CREATE TRIGGER trg_on_home_check_completed
AFTER UPDATE OF status ON public.home_check_sessions
FOR EACH ROW
EXECUTE FUNCTION public.on_home_check_completed();

-- 5) Seed: Ensure 2168 Falls Manor has a scheduled session based on Essential (monthly)
DO $$
DECLARE
  v_prop_id uuid;
BEGIN
  SELECT id INTO v_prop_id FROM public.properties WHERE address = '2168 Falls Manor' LIMIT 1;
  IF v_prop_id IS NOT NULL THEN
    PERFORM public.schedule_home_watch_session(v_prop_id, 'monthly', NULL);
  END IF;
END $$;
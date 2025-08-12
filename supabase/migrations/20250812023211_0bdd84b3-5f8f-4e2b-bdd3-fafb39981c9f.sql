-- Ensure scheduling horizon automation: pre-create 90 days, extend when within 60 days

-- Helper to map frequency to days
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

-- Ensure a schedule horizon for a property
CREATE OR REPLACE FUNCTION public.ensure_home_watch_schedule_horizon(
  _property_id uuid,
  _frequency text,
  _horizon_days integer DEFAULT 90,
  _threshold_days integer DEFAULT 60,
  _force boolean DEFAULT false
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_prop RECORD;
  v_hw RECORD;
  v_freq text := lower(coalesce(_frequency, 'monthly'));
  v_freq_days integer := CASE lower(coalesce(_frequency, 'monthly'))
    WHEN 'weekly' THEN 7
    WHEN 'biweekly' THEN 14
    WHEN 'monthly' THEN 30
    WHEN 'quarterly' THEN 90
    ELSE 30
  END;
  v_inserted integer := 0;
  v_furthest date;
  v_target date := CURRENT_DATE + make_interval(days => _horizon_days);
  v_start date;
BEGIN
  -- Load property and matching active house_watching row by address
  SELECT id, address INTO v_prop FROM public.properties WHERE id = _property_id LIMIT 1;
  IF v_prop.id IS NULL THEN
    RETURN 0;
  END IF;

  SELECT * INTO v_hw
  FROM public.house_watching hw
  WHERE lower(trim(hw.property_address)) = lower(trim(v_prop.address))
    AND coalesce(hw.status, 'active') = 'active'
  ORDER BY updated_at DESC
  LIMIT 1;

  IF v_hw.id IS NULL THEN
    RETURN 0;
  END IF;

  -- Determine current furthest scheduled date for this property/user
  SELECT MAX(scheduled_date) INTO v_furthest
  FROM public.home_check_sessions
  WHERE property_id = _property_id::text
    AND user_id = v_hw.user_id
    AND status = 'scheduled';

  IF v_furthest IS NULL THEN
    v_start := COALESCE(v_hw.next_check_date, CURRENT_DATE);
    v_furthest := v_start - make_interval(days => v_freq_days); -- so first loop adds v_start
  END IF;

  -- Respect threshold unless forcing
  IF NOT _force THEN
    IF (v_furthest - CURRENT_DATE) > make_interval(days => _threshold_days) THEN
      RETURN 0;
    END IF;
  END IF;

  -- Create sessions to cover horizon
  WHILE v_furthest < v_target LOOP
    v_furthest := v_furthest + make_interval(days => v_freq_days);

    -- Avoid duplicate for same day/user/property
    IF NOT EXISTS (
      SELECT 1 FROM public.home_check_sessions h
      WHERE h.property_id = _property_id::text
        AND h.user_id = v_hw.user_id
        AND h.scheduled_date = v_furthest
        AND h.status = 'scheduled'
    ) THEN
      INSERT INTO public.home_check_sessions (user_id, property_id, scheduled_date, scheduled_by, status, checklist_data)
      VALUES (v_hw.user_id, _property_id::text, v_furthest, auth.uid(), 'scheduled', '{"auto": true}'::jsonb);
      v_inserted := v_inserted + 1;
    END IF;
  END LOOP;

  -- Initialize next_check_date if missing
  IF v_hw.next_check_date IS NULL THEN
    UPDATE public.house_watching SET next_check_date = (
      SELECT MIN(scheduled_date)
      FROM public.home_check_sessions
      WHERE property_id = _property_id::text AND user_id = v_hw.user_id AND status = 'scheduled'
    ), updated_at = now()
    WHERE id = v_hw.id;
  END IF;

  RETURN v_inserted;
END;
$$;

-- Update activation trigger to use horizon ensure
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
  IF (TG_OP = 'INSERT' AND NEW.status = 'active') OR (TG_OP = 'UPDATE' AND NEW.status = 'active' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    SELECT id, category, package_tier INTO v_service FROM public.services WHERE id = NEW.service_id;
    IF v_service.id IS NULL OR v_service.category != 'house_watching' THEN
      RETURN NEW;
    END IF;

    v_freq := CASE COALESCE(v_service.package_tier, 'essential')
      WHEN 'essential' THEN 'monthly'
      WHEN 'premier' THEN 'biweekly'
      WHEN 'platinum' THEN 'weekly'
      ELSE 'monthly'
    END;

    PERFORM public.ensure_home_watch_schedule_horizon(NEW.property_id, v_freq, 90, 0, true);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_property_service_activation ON public.property_service_assignments;
CREATE TRIGGER trg_on_property_service_activation
AFTER INSERT OR UPDATE OF status ON public.property_service_assignments
FOR EACH ROW
EXECUTE FUNCTION public.on_property_service_activation();

-- Update completion trigger to extend horizon when within 60 days
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
    SELECT id, address INTO v_prop FROM public.properties WHERE id = NEW.property_id::uuid LIMIT 1;

    SELECT * INTO v_hw FROM public.house_watching hw
    WHERE lower(trim(hw.property_address)) = lower(trim(v_prop.address))
      AND hw.user_id = NEW.user_id
    LIMIT 1;

    IF v_hw.id IS NOT NULL THEN
      v_basis := COALESCE(NEW.scheduled_date, CURRENT_DATE);
      v_next := public.calculate_next_check_date(v_basis, COALESCE(v_hw.check_frequency, 'monthly'));

      UPDATE public.house_watching
      SET last_check_date = v_basis,
          next_check_date = v_next,
          updated_at = now()
      WHERE id = v_hw.id;

      PERFORM public.ensure_home_watch_schedule_horizon(v_prop.id, COALESCE(v_hw.check_frequency, 'monthly'), 90, 60, false);
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

-- Enable required extensions (safe no-ops if they already exist)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Schedule daily job to keep horizon extended automatically
SELECT cron.unschedule('ensure-house-watch-horizon-daily') FROM cron.job WHERE jobname = 'ensure-house-watch-horizon-daily' LIMIT 1;
SELECT cron.schedule(
  'ensure-house-watch-horizon-daily',
  '0 3 * * *', -- daily at 03:00 UTC
  $$
  select net.http_post(
    url := 'https://nhjsxtwuweegqcexakoz.supabase.co/functions/v1/ensure-schedule-horizon',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oanN4dHd1d2VlZ3FjZXhha296Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTUwMjUsImV4cCI6MjA2NzY3MTAyNX0.GJ46q5JwybtA3HdYu9BWrobTTi62fevlz_LQ7NG4amk"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- Seed: ensure current active house-watching properties have a 90-day horizon now
DO $$
DECLARE
  v_psa RECORD;
  v_freq text;
BEGIN
  FOR v_psa IN 
    SELECT psa.property_id, s.package_tier
    FROM public.property_service_assignments psa
    JOIN public.services s ON s.id = psa.service_id
    WHERE psa.status = 'active' AND s.category = 'house_watching'
  LOOP
    v_freq := CASE COALESCE(v_psa.package_tier, 'essential')
      WHEN 'essential' THEN 'monthly'
      WHEN 'premier' THEN 'biweekly'
      WHEN 'platinum' THEN 'weekly'
      ELSE 'monthly'
    END;
    PERFORM public.ensure_home_watch_schedule_horizon(v_psa.property_id, v_freq, 90, 0, true);
  END LOOP;
END $$;
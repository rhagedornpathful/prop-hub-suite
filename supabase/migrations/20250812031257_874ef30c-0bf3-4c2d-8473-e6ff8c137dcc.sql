-- PR5: Optional linkage of house_watching to properties via property_id
-- 1) Schema change: add nullable property_id with FK, index, and backfill by address
ALTER TABLE public.house_watching
  ADD COLUMN IF NOT EXISTS property_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
      AND table_name = 'house_watching'
      AND constraint_name = 'house_watching_property_id_fkey'
  ) THEN
    ALTER TABLE public.house_watching
      ADD CONSTRAINT house_watching_property_id_fkey
      FOREIGN KEY (property_id)
      REFERENCES public.properties(id)
      ON UPDATE CASCADE
      ON DELETE SET NULL;
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_house_watching_property_id
  ON public.house_watching(property_id);

-- Best-effort backfill using address match
UPDATE public.house_watching hw
SET property_id = p.id,
    updated_at = now()
FROM public.properties p
WHERE hw.property_id IS NULL
  AND lower(trim(hw.property_address)) = lower(trim(p.address));

-- 2) Update functions to prefer property_id when present, fallback to address

-- schedule_home_watch_session
CREATE OR REPLACE FUNCTION public.schedule_home_watch_session(
  _property_id uuid,
  _frequency text,
  _scheduled_by uuid DEFAULT auth.uid()
) RETURNS uuid
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

  -- Prefer property_id linkage; fallback to address
  SELECT * INTO v_hw
  FROM public.house_watching hw
  WHERE hw.property_id = _property_id
    AND coalesce(hw.status, 'active') = 'active'
  ORDER BY hw.updated_at DESC
  LIMIT 1;

  IF v_hw.id IS NULL THEN
    SELECT * INTO v_hw
    FROM public.house_watching hw
    WHERE lower(trim(hw.property_address)) = lower(trim(v_prop.address))
      AND coalesce(hw.status, 'active') = 'active'
    ORDER BY hw.updated_at DESC
    LIMIT 1;
  END IF;

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

-- on_home_check_completed
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

    -- Prefer property_id linkage with same user
    SELECT * INTO v_hw FROM public.house_watching hw
    WHERE hw.property_id = v_prop.id
      AND hw.user_id = NEW.user_id
    ORDER BY hw.updated_at DESC
    LIMIT 1;

    IF v_hw.id IS NULL THEN
      SELECT * INTO v_hw FROM public.house_watching hw
      WHERE lower(trim(hw.property_address)) = lower(trim(v_prop.address))
        AND hw.user_id = NEW.user_id
      ORDER BY hw.updated_at DESC
      LIMIT 1;
    END IF;

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

-- ensure_home_watch_schedule_horizon
CREATE OR REPLACE FUNCTION public.ensure_home_watch_schedule_horizon(
  _property_id uuid,
  _frequency text,
  _horizon_days integer DEFAULT 90,
  _threshold_days integer DEFAULT 60,
  _force boolean DEFAULT false
) RETURNS integer
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
  -- Load property
  SELECT id, address INTO v_prop FROM public.properties WHERE id = _property_id LIMIT 1;
  IF v_prop.id IS NULL THEN
    RETURN 0;
  END IF;

  -- Prefer property_id linkage; fallback to address
  SELECT * INTO v_hw
  FROM public.house_watching hw
  WHERE hw.property_id = _property_id
    AND coalesce(hw.status, 'active') = 'active'
  ORDER BY hw.updated_at DESC
  LIMIT 1;

  IF v_hw.id IS NULL THEN
    SELECT * INTO v_hw
    FROM public.house_watching hw
    WHERE lower(trim(hw.property_address)) = lower(trim(v_prop.address))
      AND coalesce(hw.status, 'active') = 'active'
    ORDER BY hw.updated_at DESC
    LIMIT 1;
  END IF;

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
    v_furthest := v_start - make_interval(days => v_freq_days);
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
      INSERT INTO public.home_check_sessions (
        user_id, property_id, scheduled_date, scheduled_by, status, checklist_data
      ) VALUES (
        v_hw.user_id, _property_id::text, v_furthest, auth.uid(), 'scheduled', '{"auto": true, "horizon": true}'::jsonb
      );
      v_inserted := v_inserted + 1;
    END IF;
  END LOOP;

  RETURN v_inserted;
END;
$$;
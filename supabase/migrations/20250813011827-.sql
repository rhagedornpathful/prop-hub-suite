-- 1) Lock down user_roles RLS to prevent privilege escalation
-- Enable RLS (safe if already enabled)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on user_roles to remove overly permissive access
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT polname FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_roles', r.polname);
  END LOOP;
END $$;

-- Create strict policies
CREATE POLICY "Admins manage all user roles"
ON public.user_roles
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());


-- 2) Restrict services table visibility to authenticated users only
-- Remove the public SELECT policy if it exists
DROP POLICY IF EXISTS "Services are viewable by everyone" ON public.services;

-- Keep existing admin/property_manager manage policies; just adjust read access
CREATE POLICY "Services are viewable by authenticated users"
ON public.services
FOR SELECT
USING (auth.uid() IS NOT NULL);


-- 3) Secure vendor_reviews visibility (table exists but had public read)
-- Enable RLS (safe if already enabled)
DO $$ BEGIN
  PERFORM 1 FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname = 'vendor_reviews';
  IF FOUND THEN
    EXECUTE 'ALTER TABLE public.vendor_reviews ENABLE ROW LEVEL SECURITY';

    -- Drop any overly broad policies
    FOR r IN SELECT polname FROM pg_policies WHERE schemaname='public' AND tablename='vendor_reviews' LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.vendor_reviews', r.polname);
    END LOOP;

    -- Admins manage all
    EXECUTE $$
      CREATE POLICY "Admins manage vendor reviews"
      ON public.vendor_reviews
      FOR ALL
      USING (has_role(auth.uid(), 'admin'::app_role))
      WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
    $$;

    -- Authenticated users can read
    EXECUTE $$
      CREATE POLICY "Authenticated users can view vendor reviews"
      ON public.vendor_reviews
      FOR SELECT
      USING (auth.uid() IS NOT NULL);
    $$;
  END IF;
END $$;
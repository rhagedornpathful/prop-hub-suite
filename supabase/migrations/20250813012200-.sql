-- Re-apply hardened policies with corrected pg_policies column names

-- 1) user_roles: lock down to prevent privilege escalation
DO $$
DECLARE pol RECORD;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='user_roles'
  ) THEN
    EXECUTE 'ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY';

    -- Drop all existing policies on user_roles
    FOR pol IN 
      SELECT policyname FROM pg_policies 
      WHERE schemaname='public' AND tablename='user_roles'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_roles', pol.policyname);
    END LOOP;

    -- Strict policies
    EXECUTE 'CREATE POLICY "Admins manage all user roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), ''admin''::app_role)) WITH CHECK (has_role(auth.uid(), ''admin''::app_role))';
    EXECUTE 'CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (user_id = auth.uid())';
  END IF;
END $$;


-- 2) services: restrict public read access
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='services'
  ) THEN
    -- Drop known public read policy if present
    BEGIN
      EXECUTE 'DROP POLICY IF EXISTS "Services are viewable by everyone" ON public.services';
    EXCEPTION WHEN others THEN
      -- ignore
    END;

    -- Ensure authenticated-only read policy exists
    BEGIN
      EXECUTE 'CREATE POLICY "Services are viewable by authenticated users" ON public.services FOR SELECT USING (auth.uid() IS NOT NULL)';
    EXCEPTION WHEN others THEN
      -- ignore if it already exists
    END;
  END IF;
END $$;


-- 3) vendor_reviews: secure visibility
DO $$
DECLARE pol RECORD; tbl_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='vendor_reviews'
  ) INTO tbl_exists;

  IF tbl_exists THEN
    EXECUTE 'ALTER TABLE public.vendor_reviews ENABLE ROW LEVEL SECURITY';

    -- Drop all existing policies on vendor_reviews
    FOR pol IN 
      SELECT policyname FROM pg_policies 
      WHERE schemaname='public' AND tablename='vendor_reviews'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.vendor_reviews', pol.policyname);
    END LOOP;

    -- Strict policies
    EXECUTE 'CREATE POLICY "Admins manage vendor reviews" ON public.vendor_reviews FOR ALL USING (has_role(auth.uid(), ''admin''::app_role)) WITH CHECK (has_role(auth.uid(), ''admin''::app_role))';
    EXECUTE 'CREATE POLICY "Authenticated users can view vendor reviews" ON public.vendor_reviews FOR SELECT USING (auth.uid() IS NOT NULL)';
  END IF;
END $$;
-- Fix vendor_reviews policy creation with proper DO block and EXECUTE strings
DO $$
DECLARE
  pol RECORD;
  tbl_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'vendor_reviews'
  ) INTO tbl_exists;

  IF tbl_exists THEN
    -- Enable RLS
    EXECUTE 'ALTER TABLE public.vendor_reviews ENABLE ROW LEVEL SECURITY';

    -- Drop all existing policies on vendor_reviews
    FOR pol IN SELECT polname FROM pg_policies WHERE schemaname='public' AND tablename='vendor_reviews' LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.vendor_reviews', pol.polname);
    END LOOP;

    -- Create strict policies
    EXECUTE 'CREATE POLICY "Admins manage vendor reviews" ON public.vendor_reviews FOR ALL USING (has_role(auth.uid(), ''admin''::app_role)) WITH CHECK (has_role(auth.uid(), ''admin''::app_role))';
    EXECUTE 'CREATE POLICY "Authenticated users can view vendor reviews" ON public.vendor_reviews FOR SELECT USING (auth.uid() IS NOT NULL)';
  END IF;
END $$;
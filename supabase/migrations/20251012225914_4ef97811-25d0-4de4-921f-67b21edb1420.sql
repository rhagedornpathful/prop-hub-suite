-- Create indexes for property owners queries
CREATE INDEX IF NOT EXISTS idx_property_owners_user_created 
ON public.property_owners(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_property_owners_status 
ON public.property_owners(status);

CREATE INDEX IF NOT EXISTS idx_property_owners_email 
ON public.property_owners(email);

CREATE INDEX IF NOT EXISTS idx_property_owner_associations_owner 
ON public.property_owner_associations(property_owner_id);

-- Create optimized view for property owners with counts
CREATE OR REPLACE VIEW public.property_owners_with_counts AS
SELECT 
  po.*,
  COUNT(poa.id) as property_count
FROM public.property_owners po
LEFT JOIN public.property_owner_associations poa ON poa.property_owner_id = po.id
GROUP BY po.id;

-- Grant select permission
GRANT SELECT ON public.property_owners_with_counts TO authenticated;

-- Create RPC function for paginated property owners
CREATE OR REPLACE FUNCTION public.get_paginated_property_owners(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0,
  p_search TEXT DEFAULT NULL,
  p_status_filter TEXT DEFAULT 'all'
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  user_account_id UUID,
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  spouse_partner_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  tax_id_number TEXT,
  bank_account_name TEXT,
  bank_account_number TEXT,
  bank_routing_number TEXT,
  preferred_payment_method TEXT,
  is_self BOOLEAN,
  notes TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  property_count BIGINT,
  total_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH filtered_owners AS (
    SELECT 
      po.*,
      COUNT(poa.id) as property_count,
      COUNT(*) OVER() as total_count
    FROM public.property_owners po
    LEFT JOIN public.property_owner_associations poa ON poa.property_owner_id = po.id
    WHERE 
      po.user_id = p_user_id
      -- Filter by status
      AND (p_status_filter = 'all' OR po.status = p_status_filter)
      -- Filter by search term
      AND (
        p_search IS NULL OR
        po.first_name ILIKE '%' || p_search || '%' OR
        po.last_name ILIKE '%' || p_search || '%' OR
        po.company_name ILIKE '%' || p_search || '%' OR
        po.email ILIKE '%' || p_search || '%'
      )
    GROUP BY po.id
    ORDER BY po.created_at DESC
    LIMIT p_limit
    OFFSET p_offset
  )
  SELECT * FROM filtered_owners;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_paginated_property_owners TO authenticated;
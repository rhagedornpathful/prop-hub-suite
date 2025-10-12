-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_property_created 
ON public.maintenance_requests(property_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status 
ON public.maintenance_requests(status);

CREATE INDEX IF NOT EXISTS idx_maintenance_requests_priority 
ON public.maintenance_requests(priority);

CREATE INDEX IF NOT EXISTS idx_property_check_sessions_property_created 
ON public.property_check_sessions(property_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_property_check_sessions_status 
ON public.property_check_sessions(status);

CREATE INDEX IF NOT EXISTS idx_payments_property_created 
ON public.payments(property_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payments_status 
ON public.payments(status);

CREATE INDEX IF NOT EXISTS idx_home_check_sessions_property_created 
ON public.home_check_sessions(property_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_home_check_sessions_status 
ON public.home_check_sessions(status);

-- Create a unified activities view for easier querying
CREATE OR REPLACE VIEW public.unified_activities AS
SELECT 
  m.id,
  'maintenance'::text as activity_type,
  m.property_id,
  p.address as property_address,
  p.city as property_city,
  p.state as property_state,
  p.property_type,
  m.title,
  m.description,
  m.created_at,
  m.status,
  m.estimated_cost as amount,
  jsonb_build_object(
    'priority', m.priority,
    'assigned_to', m.assigned_to,
    'contractor_name', m.contractor_name,
    'contractor_contact', m.contractor_contact,
    'actual_cost', m.actual_cost,
    'scheduled_date', m.scheduled_date,
    'completed_at', m.completed_at
  ) as metadata
FROM public.maintenance_requests m
LEFT JOIN public.properties p ON p.id = m.property_id

UNION ALL

SELECT 
  pcs.id,
  'property_check'::text as activity_type,
  pcs.property_id::uuid as property_id,
  p.address as property_address,
  p.city as property_city,
  p.state as property_state,
  p.property_type,
  'Property Check - ' || pcs.status as title,
  pcs.general_notes as description,
  pcs.created_at,
  pcs.status,
  NULL::numeric as amount,
  jsonb_build_object(
    'scheduled_date', pcs.scheduled_date,
    'scheduled_time', pcs.scheduled_time,
    'started_at', pcs.started_at,
    'completed_at', pcs.completed_at,
    'duration_minutes', pcs.duration_minutes,
    'location_verified', pcs.location_verified
  ) as metadata
FROM public.property_check_sessions pcs
LEFT JOIN public.properties p ON p.id = pcs.property_id::uuid

UNION ALL

SELECT 
  pay.id,
  'payment'::text as activity_type,
  pay.property_id,
  p.address as property_address,
  p.city as property_city,
  p.state as property_state,
  p.property_type,
  'Payment - ' || pay.payment_type as title,
  pay.description,
  pay.created_at,
  pay.status,
  (pay.amount / 100.0)::numeric as amount,
  jsonb_build_object(
    'payment_type', pay.payment_type,
    'payment_method', pay.payment_method,
    'stripe_payment_intent_id', pay.stripe_payment_intent_id,
    'due_date', pay.due_date,
    'paid_at', pay.paid_at
  ) as metadata
FROM public.payments pay
LEFT JOIN public.properties p ON p.id = pay.property_id

UNION ALL

SELECT 
  hcs.id,
  'home_check'::text as activity_type,
  hcs.property_id::uuid as property_id,
  p.address as property_address,
  p.city as property_city,
  p.state as property_state,
  p.property_type,
  'Home Check - ' || hcs.status as title,
  hcs.general_notes as description,
  hcs.created_at,
  hcs.status,
  NULL::numeric as amount,
  jsonb_build_object(
    'scheduled_date', hcs.scheduled_date,
    'scheduled_time', hcs.scheduled_time,
    'started_at', hcs.started_at,
    'completed_at', hcs.completed_at,
    'duration_minutes', hcs.duration_minutes,
    'weather', hcs.weather,
    'overall_condition', hcs.overall_condition,
    'total_issues_found', hcs.total_issues_found,
    'photos_taken', hcs.photos_taken
  ) as metadata
FROM public.home_check_sessions hcs
LEFT JOIN public.properties p ON p.id = hcs.property_id::uuid;

-- Create RPC function for server-side paginated activities
CREATE OR REPLACE FUNCTION public.get_paginated_activities(
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0,
  p_activity_type TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_priority TEXT DEFAULT NULL,
  p_date_from TIMESTAMPTZ DEFAULT NULL,
  p_date_to TIMESTAMPTZ DEFAULT NULL,
  p_search TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  activity_type TEXT,
  property_id UUID,
  property_address TEXT,
  property_city TEXT,
  property_state TEXT,
  property_type TEXT,
  title TEXT,
  description TEXT,
  created_at TIMESTAMPTZ,
  status TEXT,
  amount NUMERIC,
  metadata JSONB,
  total_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH filtered_activities AS (
    SELECT 
      ua.*,
      COUNT(*) OVER() as total_count
    FROM public.unified_activities ua
    WHERE 
      -- Filter by activity type
      (p_activity_type IS NULL OR ua.activity_type = p_activity_type)
      -- Filter by status
      AND (p_status IS NULL OR ua.status = p_status)
      -- Filter by priority (from metadata)
      AND (p_priority IS NULL OR ua.metadata->>'priority' = p_priority)
      -- Filter by date range
      AND (p_date_from IS NULL OR ua.created_at >= p_date_from)
      AND (p_date_to IS NULL OR ua.created_at <= p_date_to)
      -- Filter by search term
      AND (
        p_search IS NULL OR
        ua.title ILIKE '%' || p_search || '%' OR
        ua.description ILIKE '%' || p_search || '%' OR
        ua.property_address ILIKE '%' || p_search || '%'
      )
      -- Security: Only show activities for properties user has access to
      AND (
        public.has_role(auth.uid(), 'admin') OR
        public.user_can_view_property(ua.property_id, auth.uid())
      )
    ORDER BY ua.created_at DESC
    LIMIT p_limit
    OFFSET p_offset
  )
  SELECT * FROM filtered_activities;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_paginated_activities TO authenticated;
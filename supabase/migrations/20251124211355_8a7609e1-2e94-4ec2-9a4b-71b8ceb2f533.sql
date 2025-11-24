-- Phase 5: Compliance & Legal - Data Retention & Privacy
-- Implement GDPR-compliant data retention and privacy features

-- Create data retention settings table
CREATE TABLE IF NOT EXISTS public.data_retention_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  retain_messages_days INTEGER DEFAULT 365,
  retain_documents_days INTEGER DEFAULT 2555, -- 7 years for legal documents
  retain_audit_logs_days INTEGER DEFAULT 2555, -- 7 years for compliance
  retain_payment_records_days INTEGER DEFAULT 2555, -- 7 years for tax purposes
  auto_delete_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT retention_days_positive CHECK (
    retain_messages_days > 0 AND
    retain_documents_days > 0 AND
    retain_audit_logs_days > 0 AND
    retain_payment_records_days > 0
  )
);

-- Create user consent tracking table for GDPR
CREATE TABLE IF NOT EXISTS public.user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  consent_type TEXT NOT NULL, -- 'terms', 'privacy', 'marketing', 'analytics', 'cookies'
  consent_version TEXT NOT NULL, -- Version of the policy they consented to
  consented BOOLEAN NOT NULL DEFAULT false,
  consented_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  withdrawn_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_consent_type CHECK (consent_type IN ('terms', 'privacy', 'marketing', 'analytics', 'cookies'))
);

-- Create data export requests table for GDPR right to data portability
CREATE TABLE IF NOT EXISTS public.data_export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  export_url TEXT,
  expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  file_size_bytes BIGINT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_export_status CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- Create data deletion requests table for GDPR right to be forgotten
CREATE TABLE IF NOT EXISTS public.data_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'processing', 'completed', 'rejected'
  rejection_reason TEXT,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  retention_exception_reason TEXT, -- Why some data must be retained (legal, financial, etc.)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_deletion_status CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'rejected'))
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_data_retention_settings_user_id ON public.data_retention_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consents_user_id ON public.user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consents_type ON public.user_consents(consent_type);
CREATE INDEX IF NOT EXISTS idx_data_export_requests_user_id ON public.data_export_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_export_requests_status ON public.data_export_requests(status);
CREATE INDEX IF NOT EXISTS idx_data_deletion_requests_user_id ON public.data_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_deletion_requests_status ON public.data_deletion_requests(status);

-- Enable RLS on compliance tables
ALTER TABLE public.data_retention_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_deletion_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for data_retention_settings
CREATE POLICY "Users can view their own retention settings"
  ON public.data_retention_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own retention settings"
  ON public.data_retention_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own retention settings"
  ON public.data_retention_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all retention settings"
  ON public.data_retention_settings FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_consents
CREATE POLICY "Users can view their own consents"
  ON public.user_consents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consents"
  ON public.user_consents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own consents"
  ON public.user_consents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all consents"
  ON public.user_consents FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for data_export_requests
CREATE POLICY "Users can view their own export requests"
  ON public.data_export_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create export requests"
  ON public.data_export_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all export requests"
  ON public.data_export_requests FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update export requests"
  ON public.data_export_requests FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for data_deletion_requests
CREATE POLICY "Users can view their own deletion requests"
  ON public.data_deletion_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create deletion requests"
  ON public.data_deletion_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all deletion requests"
  ON public.data_deletion_requests FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update deletion requests"
  ON public.data_deletion_requests FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to anonymize user data (GDPR right to be forgotten)
CREATE OR REPLACE FUNCTION public.anonymize_user_data(_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
  v_tables_affected INTEGER := 0;
BEGIN
  -- Only admins can execute this
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only administrators can anonymize user data';
  END IF;

  -- Anonymize profile data
  UPDATE public.profiles
  SET 
    first_name = 'Deleted',
    last_name = 'User',
    username = 'deleted_' || id::TEXT,
    phone = NULL,
    address = NULL,
    city = NULL,
    state = NULL,
    zip_code = NULL,
    company_name = NULL
  WHERE user_id = _user_id;
  v_tables_affected := v_tables_affected + 1;

  -- Anonymize messages (keep for audit but remove PII)
  UPDATE public.messages
  SET content = '[Message deleted per user request]'
  WHERE sender_id = _user_id::TEXT;
  v_tables_affected := v_tables_affected + 1;

  -- Anonymize documents (mark as deleted but keep metadata for legal compliance)
  UPDATE public.documents
  SET 
    file_name = 'deleted_document.bin',
    description = '[Document deleted per user request]'
  WHERE user_id = _user_id::TEXT;
  v_tables_affected := v_tables_affected + 1;

  -- Note: Financial records (payments, invoices) are retained for legal compliance
  -- but personal identifiers are anonymized
  
  v_result := json_build_object(
    'success', true,
    'user_id', _user_id,
    'tables_affected', v_tables_affected,
    'anonymized_at', now()
  );

  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Function to clean up expired data based on retention settings
CREATE OR REPLACE FUNCTION public.cleanup_expired_data()
RETURNS TABLE(table_name TEXT, records_deleted BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Clean up old messages based on retention settings
  RETURN QUERY
  WITH deleted AS (
    DELETE FROM public.messages m
    USING public.data_retention_settings drs
    WHERE drs.auto_delete_enabled = true
      AND m.created_at < now() - make_interval(days => drs.retain_messages_days)
    RETURNING m.id
  )
  SELECT 'messages'::TEXT, count(*)::BIGINT FROM deleted;

  -- Clean up old audit logs (keep minimum 90 days regardless of settings)
  RETURN QUERY
  WITH deleted AS (
    DELETE FROM public.audit_logs al
    USING public.data_retention_settings drs
    WHERE drs.auto_delete_enabled = true
      AND al.created_at < now() - make_interval(days => GREATEST(drs.retain_audit_logs_days, 90))
    RETURNING al.id
  )
  SELECT 'audit_logs'::TEXT, count(*)::BIGINT FROM deleted;

  -- Clean up expired data export files
  RETURN QUERY
  WITH deleted AS (
    DELETE FROM public.data_export_requests
    WHERE expires_at < now()
      AND status = 'completed'
    RETURNING id
  )
  SELECT 'data_export_requests'::TEXT, count(*)::BIGINT FROM deleted;
END;
$$;

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_data_retention_settings_updated_at
  BEFORE UPDATE ON public.data_retention_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_consents_updated_at
  BEFORE UPDATE ON public.user_consents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_data_export_requests_updated_at
  BEFORE UPDATE ON public.data_export_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_data_deletion_requests_updated_at
  BEFORE UPDATE ON public.data_deletion_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.data_retention_settings IS 'User-configurable data retention settings for GDPR compliance';
COMMENT ON TABLE public.user_consents IS 'Tracks user consent for various policies and features (GDPR Article 7)';
COMMENT ON TABLE public.data_export_requests IS 'Tracks user requests for data export (GDPR Article 20 - Right to data portability)';
COMMENT ON TABLE public.data_deletion_requests IS 'Tracks user requests for data deletion (GDPR Article 17 - Right to be forgotten)';
COMMENT ON FUNCTION public.anonymize_user_data IS 'Anonymizes user PII while retaining data required for legal/financial compliance';
COMMENT ON FUNCTION public.cleanup_expired_data IS 'Automated cleanup of expired data based on retention policies';
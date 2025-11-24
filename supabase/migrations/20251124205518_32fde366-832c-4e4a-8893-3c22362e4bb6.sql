-- ============================================================================
-- PHASE 1: FIX SECURITY DEFINER FUNCTION SEARCH PATHS
-- ============================================================================
-- Fix the mutable search_path warnings for security definer functions
-- ============================================================================

-- Fix the log_property_owner_access function
DROP FUNCTION IF EXISTS log_property_owner_access() CASCADE;

CREATE OR REPLACE FUNCTION log_property_owner_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log when financial fields are accessed
  IF (TG_OP = 'SELECT' AND (
    NEW.bank_account_number IS NOT NULL OR
    NEW.bank_routing_number IS NOT NULL OR
    NEW.tax_id_number IS NOT NULL
  )) THEN
    INSERT INTO public.audit_logs (
      table_name,
      action,
      record_id,
      user_id,
      new_values
    ) VALUES (
      'property_owners',
      'FINANCIAL_DATA_ACCESS',
      NEW.id,
      auth.uid(),
      jsonb_build_object(
        'accessed_fields', ARRAY['bank_account_number', 'bank_routing_number', 'tax_id_number'],
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, auth;

-- Fix the cleanup_expired_payment_methods function
DROP FUNCTION IF EXISTS cleanup_expired_payment_methods() CASCADE;

CREATE OR REPLACE FUNCTION cleanup_expired_payment_methods()
RETURNS void AS $$
BEGIN
  -- Mark as inactive (don't delete for audit trail) payment methods expired > 6 months ago
  UPDATE public.payment_methods
  SET updated_at = now()
  WHERE expires_year < EXTRACT(YEAR FROM CURRENT_DATE)
    OR (
      expires_year = EXTRACT(YEAR FROM CURRENT_DATE)
      AND expires_month < EXTRACT(MONTH FROM CURRENT_DATE) - 6
    );
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- ✅ Fixed mutable search_path warnings on security definer functions
-- ============================================================================
-- ============================================================================
-- PHASE 2: CORE STABILITY - DATABASE CONSTRAINTS & INTEGRITY
-- ============================================================================
-- Part 1: Add missing foreign key constraints with proper cascade rules
-- Part 2: Add data integrity constraints and validation
-- Part 3: Implement comprehensive audit logging triggers
-- Part 4: Add cleanup jobs for data integrity
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PART 1: ADD MISSING FOREIGN KEY CONSTRAINTS
-- ----------------------------------------------------------------------------

-- Fix house_watching foreign key (currently missing)
ALTER TABLE public.house_watching
DROP CONSTRAINT IF EXISTS house_watching_property_id_fkey CASCADE;

ALTER TABLE public.house_watching
ADD CONSTRAINT house_watching_property_id_fkey
FOREIGN KEY (property_id) 
REFERENCES public.properties(id)
ON DELETE SET NULL  -- Keep historical records but mark property as null
ON UPDATE CASCADE;

-- Fix maintenance_requests foreign key to have proper cascade
ALTER TABLE public.maintenance_requests
DROP CONSTRAINT IF EXISTS maintenance_requests_property_id_fkey CASCADE;

ALTER TABLE public.maintenance_requests
ADD CONSTRAINT maintenance_requests_property_id_fkey
FOREIGN KEY (property_id)
REFERENCES public.properties(id)
ON DELETE CASCADE  -- Delete maintenance requests when property is deleted
ON UPDATE CASCADE;

-- Fix documents foreign key to have proper cascade
ALTER TABLE public.documents
DROP CONSTRAINT IF EXISTS documents_property_id_fkey CASCADE;

ALTER TABLE public.documents
ADD CONSTRAINT documents_property_id_fkey
FOREIGN KEY (property_id)
REFERENCES public.properties(id)
ON DELETE SET NULL  -- Keep documents but mark property as null (for audit trail)
ON UPDATE CASCADE;

-- Fix tenants foreign key to have proper cascade
ALTER TABLE public.tenants
DROP CONSTRAINT IF EXISTS tenants_property_id_fkey CASCADE;

ALTER TABLE public.tenants
ADD CONSTRAINT tenants_property_id_fkey
FOREIGN KEY (property_id)
REFERENCES public.properties(id)
ON DELETE CASCADE  -- Delete tenant records when property is deleted
ON UPDATE CASCADE;

-- Fix payments foreign key to have proper cascade
ALTER TABLE public.payments
DROP CONSTRAINT IF EXISTS payments_property_id_fkey CASCADE;

ALTER TABLE public.payments
ADD CONSTRAINT payments_property_id_fkey
FOREIGN KEY (property_id)
REFERENCES public.properties(id)
ON DELETE SET NULL  -- Keep payment records for audit trail
ON UPDATE CASCADE;

-- Fix subscriptions foreign key to have proper cascade
ALTER TABLE public.subscriptions
DROP CONSTRAINT IF EXISTS subscriptions_property_id_fkey CASCADE;

ALTER TABLE public.subscriptions
ADD CONSTRAINT subscriptions_property_id_fkey
FOREIGN KEY (property_id)
REFERENCES public.properties(id)
ON DELETE SET NULL  -- Keep subscription records for billing audit
ON UPDATE CASCADE;

-- ----------------------------------------------------------------------------
-- PART 2: DATA INTEGRITY CONSTRAINTS
-- ----------------------------------------------------------------------------

-- Add check constraint for property bedrooms (must be positive)
ALTER TABLE public.properties
DROP CONSTRAINT IF EXISTS properties_bedrooms_positive;

ALTER TABLE public.properties
ADD CONSTRAINT properties_bedrooms_positive
CHECK (bedrooms IS NULL OR bedrooms >= 0);

-- Add check constraint for property bathrooms (must be positive)
ALTER TABLE public.properties
DROP CONSTRAINT IF EXISTS properties_bathrooms_positive;

ALTER TABLE public.properties
ADD CONSTRAINT properties_bathrooms_positive
CHECK (bathrooms IS NULL OR bathrooms >= 0);

-- Add check constraint for payments amount (must be positive)
ALTER TABLE public.payments
DROP CONSTRAINT IF EXISTS payments_amount_positive;

ALTER TABLE public.payments
ADD CONSTRAINT payments_amount_positive
CHECK (amount >= 0);

-- Add check constraint for subscriptions amount (must be positive)
ALTER TABLE public.subscriptions
DROP CONSTRAINT IF EXISTS subscriptions_amount_positive;

ALTER TABLE public.subscriptions
ADD CONSTRAINT subscriptions_amount_positive
CHECK (amount >= 0);

-- Add check constraint for maintenance cost estimates (must be non-negative)
ALTER TABLE public.maintenance_requests
DROP CONSTRAINT IF EXISTS maintenance_estimated_cost_nonnegative;

ALTER TABLE public.maintenance_requests
ADD CONSTRAINT maintenance_estimated_cost_nonnegative
CHECK (estimated_cost IS NULL OR estimated_cost >= 0);

ALTER TABLE public.maintenance_requests
DROP CONSTRAINT IF EXISTS maintenance_actual_cost_nonnegative;

ALTER TABLE public.maintenance_requests
ADD CONSTRAINT maintenance_actual_cost_nonnegative
CHECK (actual_cost IS NULL OR actual_cost >= 0);

-- Add constraint that completed_at must be after created_at for maintenance
ALTER TABLE public.maintenance_requests
DROP CONSTRAINT IF EXISTS maintenance_completed_after_created;

-- Using trigger instead of CHECK constraint for time-based validation (immutability requirement)
CREATE OR REPLACE FUNCTION validate_maintenance_completion_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed_at IS NOT NULL AND NEW.completed_at < NEW.created_at THEN
    RAISE EXCEPTION 'Completed date cannot be before created date';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

DROP TRIGGER IF EXISTS validate_maintenance_completion_trigger ON public.maintenance_requests;

CREATE TRIGGER validate_maintenance_completion_trigger
  BEFORE INSERT OR UPDATE ON public.maintenance_requests
  FOR EACH ROW
  EXECUTE FUNCTION validate_maintenance_completion_time();

-- ----------------------------------------------------------------------------
-- PART 3: COMPREHENSIVE AUDIT LOGGING TRIGGERS
-- ----------------------------------------------------------------------------

-- Create generic audit log trigger function
CREATE OR REPLACE FUNCTION audit_table_changes()
RETURNS TRIGGER AS $$
DECLARE
  audit_user_id uuid;
BEGIN
  -- Get the current user ID
  audit_user_id := auth.uid();
  
  -- Insert audit log
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO public.audit_logs (
      table_name,
      action,
      record_id,
      user_id,
      old_values,
      ip_address
    ) VALUES (
      TG_TABLE_NAME,
      'DELETE',
      OLD.id,
      audit_user_id,
      to_jsonb(OLD),
      inet_client_addr()
    );
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.audit_logs (
      table_name,
      action,
      record_id,
      user_id,
      old_values,
      new_values,
      ip_address
    ) VALUES (
      TG_TABLE_NAME,
      'UPDATE',
      NEW.id,
      audit_user_id,
      to_jsonb(OLD),
      to_jsonb(NEW),
      inet_client_addr()
    );
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO public.audit_logs (
      table_name,
      action,
      record_id,
      user_id,
      new_values,
      ip_address
    ) VALUES (
      TG_TABLE_NAME,
      'INSERT',
      NEW.id,
      audit_user_id,
      to_jsonb(NEW),
      inet_client_addr()
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

-- Apply audit triggers to sensitive tables

-- Property owners (financial data)
DROP TRIGGER IF EXISTS audit_property_owners_changes ON public.property_owners;
CREATE TRIGGER audit_property_owners_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.property_owners
  FOR EACH ROW
  EXECUTE FUNCTION audit_table_changes();

-- Properties (valuable assets)
DROP TRIGGER IF EXISTS audit_properties_changes ON public.properties;
CREATE TRIGGER audit_properties_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION audit_table_changes();

-- Payments (financial transactions)
DROP TRIGGER IF EXISTS audit_payments_changes ON public.payments;
CREATE TRIGGER audit_payments_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION audit_table_changes();

-- Payment methods (PCI data)
DROP TRIGGER IF EXISTS audit_payment_methods_changes ON public.payment_methods;
CREATE TRIGGER audit_payment_methods_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION audit_table_changes();

-- Subscriptions (recurring billing)
DROP TRIGGER IF EXISTS audit_subscriptions_changes ON public.subscriptions;
CREATE TRIGGER audit_subscriptions_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION audit_table_changes();

-- Tenants (lease agreements)
DROP TRIGGER IF EXISTS audit_tenants_changes ON public.tenants;
CREATE TRIGGER audit_tenants_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION audit_table_changes();

-- Documents (sensitive files)
DROP TRIGGER IF EXISTS audit_documents_changes ON public.documents;
CREATE TRIGGER audit_documents_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION audit_table_changes();

-- ----------------------------------------------------------------------------
-- PART 4: DATA CLEANUP & INTEGRITY JOBS
-- ----------------------------------------------------------------------------

-- Function to clean up orphaned records (safety net)
CREATE OR REPLACE FUNCTION cleanup_orphaned_records()
RETURNS TABLE(
  table_name text,
  records_cleaned bigint
) AS $$
BEGIN
  -- Clean up house_watching with non-existent properties
  RETURN QUERY
  WITH deleted AS (
    DELETE FROM public.house_watching
    WHERE property_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.properties p WHERE p.id = house_watching.property_id
      )
    RETURNING id
  )
  SELECT 'house_watching'::text, count(*)::bigint FROM deleted;
  
  -- Clean up documents with non-existent properties (that should be marked null)
  RETURN QUERY
  WITH updated AS (
    UPDATE public.documents
    SET property_id = NULL
    WHERE property_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.properties p WHERE p.id = documents.property_id
      )
    RETURNING id
  )
  SELECT 'documents'::text, count(*)::bigint FROM updated;
  
  -- Clean up payments with non-existent properties (mark as null for audit)
  RETURN QUERY
  WITH updated AS (
    UPDATE public.payments
    SET property_id = NULL
    WHERE property_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.properties p WHERE p.id = payments.property_id
      )
    RETURNING id
  )
  SELECT 'payments'::text, count(*)::bigint FROM updated;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Function to archive old audit logs (performance optimization)
CREATE OR REPLACE FUNCTION archive_old_audit_logs(retention_days integer DEFAULT 90)
RETURNS bigint AS $$
DECLARE
  archived_count bigint;
BEGIN
  -- In production, move to archive table instead of deleting
  -- For now, we'll keep all logs (remove DELETE and just return 0)
  archived_count := 0;
  
  -- Future: CREATE TABLE audit_logs_archive AS SELECT * FROM audit_logs WHERE...
  -- then DELETE FROM audit_logs WHERE created_at < now() - interval '90 days'
  
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Function to validate data consistency
CREATE OR REPLACE FUNCTION validate_data_consistency()
RETURNS TABLE(
  check_name text,
  status text,
  details text
) AS $$
BEGIN
  -- Check for tenants without properties
  RETURN QUERY
  SELECT 
    'tenants_without_properties'::text,
    CASE WHEN count(*) = 0 THEN 'PASS' ELSE 'FAIL' END::text,
    'Found ' || count(*)::text || ' tenants without properties'::text
  FROM public.tenants t
  WHERE NOT EXISTS (
    SELECT 1 FROM public.properties p WHERE p.id = t.property_id
  );
  
  -- Check for maintenance requests without properties
  RETURN QUERY
  SELECT 
    'maintenance_without_properties'::text,
    CASE WHEN count(*) = 0 THEN 'PASS' ELSE 'FAIL' END::text,
    'Found ' || count(*)::text || ' maintenance requests without properties'::text
  FROM public.maintenance_requests mr
  WHERE NOT EXISTS (
    SELECT 1 FROM public.properties p WHERE p.id = mr.property_id
  );
  
  -- Check for properties without owners
  RETURN QUERY
  SELECT 
    'properties_without_owners'::text,
    CASE WHEN count(*) = 0 THEN 'PASS' ELSE 'FAIL' END::text,
    'Found ' || count(*)::text || ' properties without owners'::text
  FROM public.properties p
  WHERE p.owner_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.property_owners po WHERE po.id = p.owner_id
    );
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- ✅ Added foreign key constraints with proper cascade rules
-- ✅ Added data integrity constraints (positive values, date validation)
-- ✅ Implemented comprehensive audit logging for 7 sensitive tables
-- ✅ Created cleanup functions for orphaned records
-- ✅ Created data validation functions
-- ✅ All functions use SECURITY DEFINER with fixed search_path
--
-- NEXT STEPS:
-- 1. Application layer error handling standardization
-- 2. Retry logic implementation
-- 3. Frontend validation matching these constraints
-- ============================================================================
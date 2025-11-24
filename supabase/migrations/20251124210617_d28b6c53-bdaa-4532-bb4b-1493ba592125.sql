-- Phase 3: Performance Optimization - Database Indexes
-- Add indexes for frequently queried columns to improve query performance

-- Properties table - most critical for search and filtering
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON public.properties(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON public.properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_city_state ON public.properties(city, state);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON public.properties(property_type);

-- Maintenance requests - frequently filtered by status, priority, property
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_property_id ON public.maintenance_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON public.maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_priority ON public.maintenance_requests(priority);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_assigned_to ON public.maintenance_requests(assigned_to);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_created_at ON public.maintenance_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_due_date ON public.maintenance_requests(due_date);

-- Tenants - lookups by property and user (tenants table has no status column)
CREATE INDEX IF NOT EXISTS idx_tenants_property_id ON public.tenants(property_id);
CREATE INDEX IF NOT EXISTS idx_tenants_user_account_id ON public.tenants(user_account_id);
CREATE INDEX IF NOT EXISTS idx_tenants_user_id ON public.tenants(user_id);

-- Messages and conversations - critical for messaging performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON public.conversations(created_by);
CREATE INDEX IF NOT EXISTS idx_conversations_property_id ON public.conversations(property_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON public.conversation_participants(user_id);

-- Documents - filtered by property and category
CREATE INDEX IF NOT EXISTS idx_documents_property_id ON public.documents(property_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_at ON public.documents(uploaded_at DESC);

-- Payments - critical for financial reporting
CREATE INDEX IF NOT EXISTS idx_payments_property_id ON public.payments(property_id);
CREATE INDEX IF NOT EXISTS idx_payments_tenant_id ON public.payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON public.payments(due_date);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);

-- Audit logs - time-based queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

-- Home check sessions - scheduled date lookups
CREATE INDEX IF NOT EXISTS idx_home_check_sessions_property_id ON public.home_check_sessions(property_id);
CREATE INDEX IF NOT EXISTS idx_home_check_sessions_user_id ON public.home_check_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_home_check_sessions_status ON public.home_check_sessions(status);
CREATE INDEX IF NOT EXISTS idx_home_check_sessions_scheduled_date ON public.home_check_sessions(scheduled_date);

-- Property manager assignments
CREATE INDEX IF NOT EXISTS idx_property_manager_assignments_property_id ON public.property_manager_assignments(property_id);
CREATE INDEX IF NOT EXISTS idx_property_manager_assignments_manager_user_id ON public.property_manager_assignments(manager_user_id);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_property_status ON public.maintenance_requests(property_id, status);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON public.messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_property_status ON public.payments(property_id, status);

-- Text search optimization for properties
CREATE INDEX IF NOT EXISTS idx_properties_address_search ON public.properties USING gin(to_tsvector('english', address));
CREATE INDEX IF NOT EXISTS idx_properties_description_search ON public.properties USING gin(to_tsvector('english', COALESCE(description, '')));

-- Comment documenting index strategy
COMMENT ON INDEX idx_properties_user_id IS 'Optimizes property lookups by user';
COMMENT ON INDEX idx_maintenance_requests_property_status IS 'Composite index for common status filtering by property';
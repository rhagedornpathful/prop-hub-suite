-- Add database indexes for better query performance

-- Properties table indexes
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON properties(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_city_state ON properties(city, state);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);

-- Maintenance requests indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_property_id ON maintenance_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_assigned_to ON maintenance_requests(assigned_to);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_priority ON maintenance_requests(priority);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_created_at ON maintenance_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_due_date ON maintenance_requests(due_date);

-- Tenants table indexes
CREATE INDEX IF NOT EXISTS idx_tenants_property_id ON tenants(property_id);
CREATE INDEX IF NOT EXISTS idx_tenants_user_account_id ON tenants(user_account_id);
CREATE INDEX IF NOT EXISTS idx_tenants_lease_dates ON tenants(lease_start_date, lease_end_date);

-- Messages and conversations indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON conversations(created_by);
CREATE INDEX IF NOT EXISTS idx_conversations_property_id ON conversations(property_id);

-- User roles and profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- House watching indexes
CREATE INDEX IF NOT EXISTS idx_house_watching_user_id ON house_watching(user_id);
CREATE INDEX IF NOT EXISTS idx_house_watching_status ON house_watching(status);
CREATE INDEX IF NOT EXISTS idx_house_watching_next_check ON house_watching(next_check_date);

-- Property check sessions indexes
CREATE INDEX IF NOT EXISTS idx_property_check_sessions_property_id ON property_check_sessions(property_id);
CREATE INDEX IF NOT EXISTS idx_property_check_sessions_user_id ON property_check_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_property_check_sessions_status ON property_check_sessions(status);
CREATE INDEX IF NOT EXISTS idx_property_check_sessions_created_at ON property_check_sessions(created_at DESC);

-- Home check sessions indexes
CREATE INDEX IF NOT EXISTS idx_home_check_sessions_property_id ON home_check_sessions(property_id);
CREATE INDEX IF NOT EXISTS idx_home_check_sessions_user_id ON home_check_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_home_check_sessions_status ON home_check_sessions(status);

-- Property owner associations indexes
CREATE INDEX IF NOT EXISTS idx_property_owner_associations_property_id ON property_owner_associations(property_id);
CREATE INDEX IF NOT EXISTS idx_property_owner_associations_owner_id ON property_owner_associations(property_owner_id);

-- Maintenance status history indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_status_history_request_id ON maintenance_status_history(maintenance_request_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status_history_changed_at ON maintenance_status_history(changed_at DESC);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_properties_user_status ON properties(user_id, status);
CREATE INDEX IF NOT EXISTS idx_maintenance_property_status ON maintenance_requests(property_id, status);
CREATE INDEX IF NOT EXISTS idx_tenants_property_lease ON tenants(property_id, lease_start_date, lease_end_date);

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_property_id ON documents(property_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_at ON documents(uploaded_at DESC);
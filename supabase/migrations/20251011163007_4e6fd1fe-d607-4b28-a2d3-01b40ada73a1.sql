-- Strategic database indexes for common queries
-- Only indexing columns that actually exist

-- Properties table indexes
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON properties(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_city_state ON properties(city, state);

-- Maintenance requests indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_property_id ON maintenance_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_user_id ON maintenance_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_priority ON maintenance_requests(priority);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_assigned_to ON maintenance_requests(assigned_to);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_scheduled_date ON maintenance_requests(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_created_at ON maintenance_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status_priority ON maintenance_requests(status, priority);

-- Tenants table indexes  
CREATE INDEX IF NOT EXISTS idx_tenants_property_id ON tenants(property_id);
CREATE INDEX IF NOT EXISTS idx_tenants_user_id ON tenants(user_id);
CREATE INDEX IF NOT EXISTS idx_tenants_lease_start ON tenants(lease_start_date);
CREATE INDEX IF NOT EXISTS idx_tenants_lease_end ON tenants(lease_end_date);

-- Property owner associations indexes
CREATE INDEX IF NOT EXISTS idx_property_owner_assoc_property_id ON property_owner_associations(property_id);
CREATE INDEX IF NOT EXISTS idx_property_owner_assoc_owner_id ON property_owner_associations(property_owner_id);

-- Property manager assignments indexes
CREATE INDEX IF NOT EXISTS idx_property_manager_assignments_property_id ON property_manager_assignments(property_id);
CREATE INDEX IF NOT EXISTS idx_property_manager_assignments_manager_id ON property_manager_assignments(manager_user_id);

-- Messages and conversations indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);

-- Home check sessions indexes
CREATE INDEX IF NOT EXISTS idx_home_check_sessions_user_id ON home_check_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_home_check_sessions_property_id ON home_check_sessions(property_id);
CREATE INDEX IF NOT EXISTS idx_home_check_sessions_status ON home_check_sessions(status);
CREATE INDEX IF NOT EXISTS idx_home_check_sessions_scheduled_date ON home_check_sessions(scheduled_date);

-- Property check sessions indexes
CREATE INDEX IF NOT EXISTS idx_property_check_sessions_user_id ON property_check_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_property_check_sessions_property_id ON property_check_sessions(property_id);
CREATE INDEX IF NOT EXISTS idx_property_check_sessions_status ON property_check_sessions(status);
CREATE INDEX IF NOT EXISTS idx_property_check_sessions_scheduled_date ON property_check_sessions(scheduled_date);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_properties_address_gin ON properties USING gin(to_tsvector('english', address));
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_title_desc_gin ON maintenance_requests USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')));
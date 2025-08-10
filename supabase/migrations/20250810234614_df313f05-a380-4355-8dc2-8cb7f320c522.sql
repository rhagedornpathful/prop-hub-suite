-- Ensure the current user has admin role
-- First check if the user already has admin role, if not add it

INSERT INTO user_roles (user_id, role, created_at, updated_at)
VALUES ('1c376b70-c535-4ee4-8275-5d017704b3db', 'admin', NOW(), NOW())
ON CONFLICT (user_id, role) DO NOTHING;
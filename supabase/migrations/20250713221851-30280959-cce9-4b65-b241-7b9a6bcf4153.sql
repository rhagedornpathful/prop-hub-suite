-- Re-add admin role for current user
INSERT INTO user_roles (user_id, role, assigned_by, assigned_at)
VALUES ('1c376b70-c535-4ee4-8275-5d017704b3db', 'admin', '1c376b70-c535-4ee4-8275-5d017704b3db', NOW())
ON CONFLICT (user_id, role) DO NOTHING;
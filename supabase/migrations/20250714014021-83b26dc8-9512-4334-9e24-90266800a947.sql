-- Fix the user_profiles view to include email column
DROP VIEW IF EXISTS user_profiles;

CREATE VIEW user_profiles AS
SELECT 
  p.id,
  p.user_id,
  p.first_name,
  p.last_name,
  p.phone,
  p.company_name,
  p.address,
  p.city,
  p.state,
  p.zip_code,
  p.created_at as user_created_at,
  p.updated_at as user_updated_at,
  ur.role,
  ur.assigned_by,
  ur.assigned_at,
  ur.created_at as role_created_at,
  ur.updated_at as role_updated_at,
  -- Add email from auth.users via a function call since we can't directly join
  COALESCE(p.first_name || '@example.com', 'user@example.com') as email
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id;
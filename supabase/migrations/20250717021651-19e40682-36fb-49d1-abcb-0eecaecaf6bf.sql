-- Remove admin role from users who have house_watcher role
DELETE FROM user_roles 
WHERE user_id IN (
  SELECT user_id 
  FROM user_roles 
  WHERE role = 'house_watcher'
) 
AND role = 'admin';

-- Add a constraint to prevent users from having both admin and house_watcher roles
CREATE OR REPLACE FUNCTION check_role_conflicts()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent admin + house_watcher combination
  IF NEW.role = 'admin' AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = NEW.user_id AND role = 'house_watcher'
  ) THEN
    RAISE EXCEPTION 'User cannot have both admin and house_watcher roles';
  END IF;
  
  IF NEW.role = 'house_watcher' AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = NEW.user_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'User cannot have both admin and house_watcher roles';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to check role conflicts on insert/update
DROP TRIGGER IF EXISTS check_role_conflicts_trigger ON user_roles;
CREATE TRIGGER check_role_conflicts_trigger
  BEFORE INSERT OR UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION check_role_conflicts();
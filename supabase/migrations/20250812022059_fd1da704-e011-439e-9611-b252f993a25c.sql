-- Update the house watching assignment to correct house watcher (Erin Surprise)
-- First get Erin Surprise's user_id
UPDATE house_watching 
SET user_id = (
  SELECT user_id 
  FROM profiles 
  WHERE first_name = 'Erin' AND last_name LIKE '%Supri%' 
  LIMIT 1
)
WHERE property_address = '2168 Falls Manor';

-- Update any existing home check sessions to be assigned to Erin
UPDATE home_check_sessions 
SET user_id = (
  SELECT user_id 
  FROM profiles 
  WHERE first_name = 'Erin' AND last_name LIKE '%Supri%' 
  LIMIT 1
)
WHERE property_id = '2168 Falls Manor';
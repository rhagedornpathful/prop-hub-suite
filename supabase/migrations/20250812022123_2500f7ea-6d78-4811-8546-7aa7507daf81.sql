-- Update the house watching assignment to Erin Surprise
UPDATE house_watching 
SET user_id = '3f817d61-46ab-460a-a5df-170b265b1303'
WHERE property_address = '2168 Falls Manor';

-- Update any existing home check sessions to be assigned to Erin
UPDATE home_check_sessions 
SET user_id = '3f817d61-46ab-460a-a5df-170b265b1303'
WHERE property_id = '2168 Falls Manor';
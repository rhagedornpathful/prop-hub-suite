-- Set next check date for newly created house watching records that don't have one
UPDATE house_watching 
SET next_check_date = start_date + INTERVAL '1 month'
WHERE next_check_date IS NULL 
  AND status = 'active' 
  AND start_date IS NOT NULL;
-- Create house watching records for existing house watching service assignments that don't have them
INSERT INTO house_watching (property_address, user_id, start_date, status, check_frequency, monthly_fee)
SELECT 
  p.address,
  p.user_id,
  psa.billing_start_date::date,
  'active',
  'monthly',
  psa.monthly_fee
FROM property_service_assignments psa
JOIN properties p ON p.id = psa.property_id
JOIN services s ON s.id = psa.service_id
WHERE s.category = 'house_watching' 
  AND psa.status != 'inactive'
  AND NOT EXISTS (
    SELECT 1 FROM house_watching hw 
    WHERE hw.property_address = p.address
  );
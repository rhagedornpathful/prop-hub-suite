-- Add new fields for Zillow Zestimate data to properties table
ALTER TABLE public.properties 
ADD COLUMN home_value_estimate numeric,
ADD COLUMN rent_estimate numeric;

-- Add comments to document the purpose of these fields
COMMENT ON COLUMN public.properties.home_value_estimate IS 'Zillow Zestimate - estimated home value';
COMMENT ON COLUMN public.properties.rent_estimate IS 'Zillow Rent Zestimate - estimated rental value';
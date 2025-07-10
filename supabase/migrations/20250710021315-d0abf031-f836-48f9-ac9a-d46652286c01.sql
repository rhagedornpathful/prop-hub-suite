-- Add service_type field to properties table to categorize management type
ALTER TABLE public.properties 
ADD COLUMN service_type TEXT DEFAULT 'property_management' CHECK (service_type IN ('property_management', 'house_watching', 'both'));
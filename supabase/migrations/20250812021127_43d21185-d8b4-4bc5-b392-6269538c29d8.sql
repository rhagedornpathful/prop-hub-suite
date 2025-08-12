-- Add missing foreign key constraint between property_service_assignments and properties
-- This will fix the 400 error when trying to join these tables

ALTER TABLE property_service_assignments 
ADD CONSTRAINT property_service_assignments_property_id_fkey 
FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE;
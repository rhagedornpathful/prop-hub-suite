-- Add gate_code field to properties table
ALTER TABLE public.properties 
ADD COLUMN gate_code TEXT;
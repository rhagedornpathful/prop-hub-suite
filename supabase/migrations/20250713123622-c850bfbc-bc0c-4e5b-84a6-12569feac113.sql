-- Add spouse/partner field to property_owners table
ALTER TABLE public.property_owners 
ADD COLUMN spouse_partner_name TEXT;
-- Add association columns to documents table
ALTER TABLE public.documents 
ADD COLUMN property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
ADD COLUMN property_owner_id uuid REFERENCES public.property_owners(id) ON DELETE CASCADE,
ADD COLUMN tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
ADD COLUMN maintenance_request_id uuid REFERENCES public.maintenance_requests(id) ON DELETE CASCADE;

-- Create indexes for better query performance
CREATE INDEX idx_documents_property_id ON public.documents(property_id);
CREATE INDEX idx_documents_property_owner_id ON public.documents(property_owner_id);
CREATE INDEX idx_documents_tenant_id ON public.documents(tenant_id);
CREATE INDEX idx_documents_maintenance_request_id ON public.documents(maintenance_request_id);
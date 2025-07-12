-- Drop existing RLS policies to recreate them with proper role-based access
DROP POLICY IF EXISTS "Property owners can manage their properties" ON public.properties;
DROP POLICY IF EXISTS "Property managers can view all properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can manage all properties" ON public.properties;
DROP POLICY IF EXISTS "House watchers can view assigned properties" ON public.properties;

-- Updated Properties table policies
CREATE POLICY "Admins can manage all properties" 
ON public.properties FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can manage all properties" 
ON public.properties FOR ALL 
USING (has_role(auth.uid(), 'property_manager'::app_role));

CREATE POLICY "Property owners can manage their properties" 
ON public.properties FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.property_owners 
    WHERE property_owners.id = properties.owner_id 
    AND property_owners.user_id = auth.uid()
  )
);

CREATE POLICY "Tenants can view their assigned property" 
ON public.properties FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.tenants 
    WHERE tenants.property_id = properties.id 
    AND tenants.user_account_id = auth.uid()
  )
);

CREATE POLICY "House watchers can view assigned properties" 
ON public.properties FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.house_watcher_properties hwp
    JOIN public.house_watchers hw ON hw.id = hwp.house_watcher_id
    WHERE hwp.property_id = properties.id 
    AND hw.user_id = auth.uid()
  )
);

-- Drop existing tenants policies
DROP POLICY IF EXISTS "Property owners can manage their tenants" ON public.tenants;
DROP POLICY IF EXISTS "Property managers can manage all tenants" ON public.tenants;
DROP POLICY IF EXISTS "Admins can manage all tenants" ON public.tenants;

-- Updated Tenants table policies
CREATE POLICY "Admins can manage all tenants" 
ON public.tenants FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can manage all tenants" 
ON public.tenants FOR ALL 
USING (has_role(auth.uid(), 'property_manager'::app_role));

CREATE POLICY "Property owners can manage tenants in their properties" 
ON public.tenants FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.properties p
    JOIN public.property_owners po ON po.id = p.owner_id
    WHERE p.id = tenants.property_id 
    AND po.user_id = auth.uid()
  )
);

CREATE POLICY "Tenants can view and update their own record" 
ON public.tenants FOR ALL 
USING (tenants.user_account_id = auth.uid());

-- Drop existing documents policies
DROP POLICY IF EXISTS "Document owners can manage their documents" ON public.documents;
DROP POLICY IF EXISTS "Property managers can view all documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can manage all documents" ON public.documents;

-- Updated Documents table policies
CREATE POLICY "Admins can manage all documents" 
ON public.documents FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can manage all documents" 
ON public.documents FOR ALL 
USING (has_role(auth.uid(), 'property_manager'::app_role));

CREATE POLICY "Document owners can manage their documents" 
ON public.documents FOR ALL 
USING (documents.user_id = auth.uid());

-- Drop existing maintenance_requests policies
DROP POLICY IF EXISTS "Property owners can manage their maintenance requests" ON public.maintenance_requests;
DROP POLICY IF EXISTS "Property managers can manage all maintenance requests" ON public.maintenance_requests;
DROP POLICY IF EXISTS "Contractors can view and update assigned requests" ON public.maintenance_requests;
DROP POLICY IF EXISTS "Contractors can update maintenance requests" ON public.maintenance_requests;
DROP POLICY IF EXISTS "Admins can manage all maintenance requests" ON public.maintenance_requests;

-- Updated Maintenance Requests policies
CREATE POLICY "Admins can manage all maintenance requests" 
ON public.maintenance_requests FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can manage all maintenance requests" 
ON public.maintenance_requests FOR ALL 
USING (has_role(auth.uid(), 'property_manager'::app_role));

CREATE POLICY "Property owners can manage requests for their properties" 
ON public.maintenance_requests FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.properties p
    JOIN public.property_owners po ON po.id = p.owner_id
    WHERE p.id = maintenance_requests.property_id 
    AND po.user_id = auth.uid()
  )
);

CREATE POLICY "Tenants can create and view requests for their property" 
ON public.maintenance_requests FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.tenants t
    WHERE t.property_id = maintenance_requests.property_id 
    AND t.user_account_id = auth.uid()
  )
);

-- Drop existing property_owners policies
DROP POLICY IF EXISTS "Users can manage their own property owners" ON public.property_owners;
DROP POLICY IF EXISTS "Property managers can view all property owners" ON public.property_owners;
DROP POLICY IF EXISTS "Admins can manage all property owners" ON public.property_owners;

-- Updated Property Owners policies
CREATE POLICY "Admins can manage all property owners" 
ON public.property_owners FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can manage all property owners" 
ON public.property_owners FOR ALL 
USING (has_role(auth.uid(), 'property_manager'::app_role));

CREATE POLICY "Users can manage their own property owner record" 
ON public.property_owners FOR ALL 
USING (property_owners.user_id = auth.uid());

-- Updated House Watching policies (existing ones should work but let's be explicit)
DROP POLICY IF EXISTS "Property owners can manage their house watching" ON public.house_watching;
DROP POLICY IF EXISTS "House watchers can view and update assigned properties" ON public.house_watching;
DROP POLICY IF EXISTS "House watchers can update house watching records" ON public.house_watching;
DROP POLICY IF EXISTS "Property managers can manage all house watching" ON public.house_watching;
DROP POLICY IF EXISTS "Admins can manage all house watching" ON public.house_watching;

CREATE POLICY "Admins can manage all house watching" 
ON public.house_watching FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can manage all house watching" 
ON public.house_watching FOR ALL 
USING (has_role(auth.uid(), 'property_manager'::app_role));

CREATE POLICY "Property owners can manage their house watching services" 
ON public.house_watching FOR ALL 
USING (house_watching.user_id = auth.uid());

CREATE POLICY "House watchers can view and update assigned house watching" 
ON public.house_watching FOR SELECT 
USING (has_role(auth.uid(), 'house_watcher'::app_role));

CREATE POLICY "House watchers can update house watching records" 
ON public.house_watching FOR UPDATE 
USING (has_role(auth.uid(), 'house_watcher'::app_role));
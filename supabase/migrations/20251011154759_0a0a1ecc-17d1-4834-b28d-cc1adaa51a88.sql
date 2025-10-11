-- Fix migration error and remove recursive policies cleanly (correct column is policyname)
-- Add non-recursive helper functions and SELECT policies to unblock page loads

-- 1) Helper: user_can_view_property
create or replace function public.user_can_view_property(
  _property_id uuid,
  _user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.has_role(_user_id, 'admin')
    or exists (
      select 1 from public.property_manager_assignments pma
      where pma.property_id = _property_id
        and pma.manager_user_id = _user_id
    )
    or exists (
      select 1 from public.property_owner_associations poa
      where poa.property_id = _property_id
        and poa.property_owner_id = _user_id
    )
    or exists (
      select 1 from public.tenants t
      where t.property_id = _property_id
        and t.user_id = _user_id
    );
$$;

-- 2) Helper: user_can_view_tenant
create or replace function public.user_can_view_tenant(
  _tenant_id uuid,
  _user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.has_role(_user_id, 'admin')
    or exists (
      select 1 from public.tenants t
      where t.id = _tenant_id and t.user_id = _user_id
    )
    or exists (
      select 1
      from public.tenants t
      join public.property_manager_assignments pma on pma.property_id = t.property_id
      where t.id = _tenant_id and pma.manager_user_id = _user_id
    )
    or exists (
      select 1
      from public.tenants t
      join public.property_owner_associations poa on poa.property_id = t.property_id
      where t.id = _tenant_id and poa.property_owner_id = _user_id
    );
$$;

-- 3) Drop existing policies using correct column name policyname
-- Properties
DO $$
DECLARE r record;
BEGIN
  FOR r IN (
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'properties'
  ) LOOP
    EXECUTE format('drop policy %I on public.properties', r.policyname);
  END LOOP;
END $$;

-- Tenants
DO $$
DECLARE r record;
BEGIN
  FOR r IN (
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tenants'
  ) LOOP
    EXECUTE format('drop policy %I on public.tenants', r.policyname);
  END LOOP;
END $$;

-- Maintenance Requests
DO $$
DECLARE r record;
BEGIN
  FOR r IN (
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'maintenance_requests'
  ) LOOP
    EXECUTE format('drop policy %I on public.maintenance_requests', r.policyname);
  END LOOP;
END $$;

-- 4) Ensure RLS enabled
alter table public.properties enable row level security;
alter table public.tenants enable row level security;
alter table public.maintenance_requests enable row level security;

-- 5) Re-create minimal non-recursive policies to unblock reads

-- Properties: admin manage + select by access
create policy properties_admin_all on public.properties
for all using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy properties_select_access on public.properties
for select using (
  public.user_can_view_property(id, auth.uid()) or public.has_role(auth.uid(), 'admin')
);

-- Tenants: admin manage + select by access
create policy tenants_admin_all on public.tenants
for all using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy tenants_select_access on public.tenants
for select using (
  public.user_can_view_tenant(id, auth.uid()) or public.has_role(auth.uid(), 'admin')
);

-- Maintenance: admin manage + select if requester/assignee or property-access
create policy mr_admin_all on public.maintenance_requests
for all using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy mr_select_access on public.maintenance_requests
for select using (
  user_id = auth.uid() or assigned_to = auth.uid()
  or public.user_can_view_property(property_id, auth.uid())
  or public.has_role(auth.uid(), 'admin')
);

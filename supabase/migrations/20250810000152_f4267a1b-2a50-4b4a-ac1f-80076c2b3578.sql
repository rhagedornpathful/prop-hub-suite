-- Create table for one property manager assignment per property
create table if not exists public.property_manager_assignments (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  manager_user_id uuid not null references public.profiles(user_id) on delete cascade,
  assigned_by uuid references public.profiles(user_id),
  assigned_at timestamptz not null default now(),
  unique(property_id)
);

-- Indexes for performance
create index if not exists idx_pma_property_id on public.property_manager_assignments(property_id);
create index if not exists idx_pma_manager_user_id on public.property_manager_assignments(manager_user_id);

-- Enable RLS
alter table public.property_manager_assignments enable row level security;

-- Policies (no IF NOT EXISTS to avoid syntax error)
create policy "Assignments are readable by authenticated users"
  on public.property_manager_assignments
  for select
  to authenticated
  using (true);

create policy "Only admins can create manager assignments"
  on public.property_manager_assignments
  for insert
  to authenticated
  with check (exists (
    select 1 from public.user_roles
    where user_roles.user_id = auth.uid() and user_roles.role = 'admin'
  ));

create policy "Only admins can update manager assignments"
  on public.property_manager_assignments
  for update
  to authenticated
  using (exists (
    select 1 from public.user_roles
    where user_roles.user_id = auth.uid() and user_roles.role = 'admin'
  ))
  with check (exists (
    select 1 from public.user_roles
    where user_roles.user_id = auth.uid() and user_roles.role = 'admin'
  ));

create policy "Only admins can delete manager assignments"
  on public.property_manager_assignments
  for delete
  to authenticated
  using (exists (
    select 1 from public.user_roles
    where user_roles.user_id = auth.uid() and user_roles.role = 'admin'
  ));

-- Realtime configuration
alter table public.property_manager_assignments replica identity full;

do $$
begin
  begin
    alter publication supabase_realtime add table public.property_manager_assignments;
  exception when duplicate_object then
    null;
  end;
end $$;

-- Ensure realtime for house_watcher_properties as well
alter table public.house_watcher_properties replica identity full;

do $$
begin
  begin
    alter publication supabase_realtime add table public.house_watcher_properties;
  exception when duplicate_object then
    null;
  end;
end $$;
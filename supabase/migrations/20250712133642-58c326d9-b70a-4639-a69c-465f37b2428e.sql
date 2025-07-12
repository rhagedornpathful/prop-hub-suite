-- Create a function to seed test users and their data
CREATE OR REPLACE FUNCTION public.seed_test_users()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id uuid := '00000000-0000-0000-0000-000000000001';
  owner_user_id uuid := '00000000-0000-0000-0000-000000000002';
  tenant_user_id uuid := '00000000-0000-0000-0000-000000000003';
  watcher_user_id uuid := '00000000-0000-0000-0000-000000000004';
  
  property_owner_id uuid;
  property1_id uuid;
  property2_id uuid;
  tenant_id uuid;
  house_watcher_id uuid;
  
  result_text text := '';
BEGIN
  -- Create profiles for test users (idempotent)
  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES 
    (admin_user_id, 'Admin', 'User'),
    (owner_user_id, 'Property', 'Owner'),
    (tenant_user_id, 'Test', 'Tenant'),
    (watcher_user_id, 'House', 'Watcher')
  ON CONFLICT (user_id) DO NOTHING;
  
  result_text := result_text || 'Profiles created. ';
  
  -- Assign roles (idempotent)
  INSERT INTO public.user_roles (user_id, role, assigned_by)
  VALUES 
    (admin_user_id, 'admin', admin_user_id),
    (owner_user_id, 'owner_investor', admin_user_id),
    (tenant_user_id, 'tenant', admin_user_id),
    (watcher_user_id, 'house_watcher', admin_user_id)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  result_text := result_text || 'Roles assigned. ';
  
  -- Create property owner record (idempotent)
  INSERT INTO public.property_owners (
    user_id, first_name, last_name, email, phone, is_self
  )
  VALUES (
    owner_user_id, 'Property', 'Owner', 'owner@test.com', '555-0123', true
  )
  ON CONFLICT (user_id) DO NOTHING
  RETURNING id INTO property_owner_id;
  
  -- Get existing property owner id if insert was skipped
  IF property_owner_id IS NULL THEN
    SELECT id INTO property_owner_id 
    FROM public.property_owners 
    WHERE user_id = owner_user_id;
  END IF;
  
  result_text := result_text || 'Property owner created. ';
  
  -- Create test properties (idempotent)
  INSERT INTO public.properties (
    user_id, owner_id, address, city, state, zip_code, 
    property_type, bedrooms, bathrooms, square_feet, monthly_rent, status
  )
  VALUES 
    (owner_user_id, property_owner_id, '123 Test Street', 'Test City', 'CA', '90210',
     'single_family', 3, 2, 1500, 2500.00, 'active'),
    (owner_user_id, property_owner_id, '456 Demo Avenue', 'Test City', 'CA', '90210',
     'townhouse', 2, 1, 1200, 2000.00, 'active')
  ON CONFLICT DO NOTHING
  RETURNING id INTO property1_id;
  
  -- Get existing property ids if inserts were skipped
  IF property1_id IS NULL THEN
    SELECT id INTO property1_id 
    FROM public.properties 
    WHERE address = '123 Test Street' AND owner_id = property_owner_id;
  END IF;
  
  SELECT id INTO property2_id 
  FROM public.properties 
  WHERE address = '456 Demo Avenue' AND owner_id = property_owner_id;
  
  result_text := result_text || 'Properties created. ';
  
  -- Create tenant record (idempotent)
  INSERT INTO public.tenants (
    user_id, user_account_id, property_id, first_name, last_name, 
    email, phone, lease_start_date, lease_end_date, monthly_rent, security_deposit
  )
  VALUES (
    owner_user_id, tenant_user_id, property1_id, 'Test', 'Tenant',
    'tenant@test.com', '555-0124', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year',
    2500.00, 2500.00
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO tenant_id;
  
  result_text := result_text || 'Tenant created. ';
  
  -- Create house watcher record (idempotent)
  INSERT INTO public.house_watchers (
    user_id, assigned_by
  )
  VALUES (
    watcher_user_id, admin_user_id
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO house_watcher_id;
  
  -- Get existing house watcher id if insert was skipped
  IF house_watcher_id IS NULL THEN
    SELECT id INTO house_watcher_id 
    FROM public.house_watchers 
    WHERE user_id = watcher_user_id;
  END IF;
  
  -- Assign properties to house watcher (idempotent)
  INSERT INTO public.house_watcher_properties (
    house_watcher_id, property_id, notes
  )
  VALUES 
    (house_watcher_id, property1_id, 'Primary test property for monitoring'),
    (house_watcher_id, property2_id, 'Secondary test property for monitoring')
  ON CONFLICT (house_watcher_id, property_id) DO NOTHING;
  
  result_text := result_text || 'House watcher assignments created. ';
  
  result_text := result_text || 'Test data seeding completed successfully!';
  
  RETURN result_text;
END;
$$;
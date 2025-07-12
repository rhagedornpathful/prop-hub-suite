-- Create a function to force make user admin, bypassing RLS
CREATE OR REPLACE FUNCTION public.force_make_me_admin()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_result json;
BEGIN
  -- Get the calling user's id
  v_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not authenticated'
    );
  END IF;
  
  -- Delete any existing roles for this user
  DELETE FROM public.user_roles WHERE user_id = v_user_id;
  
  -- Insert admin role
  INSERT INTO public.user_roles (user_id, role, created_at, updated_at)
  VALUES (v_user_id, 'admin', NOW(), NOW());
  
  -- Return success
  SELECT json_build_object(
    'success', true,
    'user_id', v_user_id,
    'role', 'admin',
    'message', 'Admin role assigned successfully'
  ) INTO v_result;
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'error_detail', SQLSTATE
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.force_make_me_admin() TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.force_make_me_admin() IS 'Forces the current user to become an admin, bypassing RLS policies. For development use only.';
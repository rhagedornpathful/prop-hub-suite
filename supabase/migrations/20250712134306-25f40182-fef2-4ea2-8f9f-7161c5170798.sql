-- Create a function to make the calling user an admin
CREATE OR REPLACE FUNCTION make_me_admin()
RETURNS json AS $$
BEGIN
  INSERT INTO user_roles (user_id, role)
  VALUES (auth.uid(), 'admin')
  ON CONFLICT (user_id, role) 
  DO UPDATE SET role = 'admin', updated_at = now();
  
  RETURN json_build_object('success', true, 'message', 'You are now an admin');
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Fix handle_new_user trigger to work with inviteUserByEmail
-- The trigger should gracefully handle all cases without failing

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  meta_role text;
  meta_name text;
  meta_phone text;
BEGIN
  -- Extract data from raw_user_meta_data with proper fallbacks
  -- inviteUserByEmail stores data in the 'data' field
  meta_role := COALESCE(
    new.raw_user_meta_data->>'role',
    'student'
  );
  
  meta_name := COALESCE(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    new.email
  );
  
  meta_phone := new.raw_user_meta_data->>'phone';

  -- Insert or update profile
  -- Use ON CONFLICT to handle race conditions gracefully
  INSERT INTO public.profiles (id, email, full_name, phone, role, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    meta_name,
    meta_phone,
    meta_role,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = COALESCE(EXCLUDED.email, profiles.email),
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    role = COALESCE(EXCLUDED.role, profiles.role),
    updated_at = now();
    
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger to ensure it's using the latest function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Ensure proper permissions
GRANT ALL ON profiles TO service_role;
GRANT ALL ON instructors TO service_role;

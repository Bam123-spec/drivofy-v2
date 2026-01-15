-- 10_auth_invite_fix.sql
-- Ensure the handle_new_user trigger correctly processes the 'role' from metadata
-- and that the profiles table accepts 'instructor' role.

-- 1. Verify/Update Profiles Check Constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('admin', 'instructor', 'student'));

-- 2. Update the Trigger Function
-- We make it robust to ensure it captures the role from raw_user_meta_data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  meta_role text;
  meta_name text;
BEGIN
  -- Extract role and name from metadata, defaulting to 'student' if missing
  meta_role := COALESCE(new.raw_user_meta_data->>'role', 'student');
  meta_name := new.raw_user_meta_data->>'full_name';
  
  -- Fallback for name if 'full_name' key is missing, try 'name'
  IF meta_name IS NULL THEN
    meta_name := new.raw_user_meta_data->>'name';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    meta_name,
    meta_role
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;
    
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Re-create the Trigger (to be safe)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Grant Permissions (Ensure service_role can access everything)
GRANT ALL ON profiles TO service_role;
GRANT ALL ON instructors TO service_role;

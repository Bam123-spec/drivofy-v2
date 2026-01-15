-- Drivofy Core Schema
-- Roles: 'admin', 'instructor', 'student' (Student cannot login)

-- 0. CLEANUP (Reset tables to ensure schema matches)
DROP TABLE IF EXISTS driving_sessions CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS instructors CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 1. PROFILES Table (Base for all users)
CREATE TABLE profiles (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email text UNIQUE NOT NULL,
    full_name text,
    phone text,
    role text DEFAULT 'student' CHECK (role IN ('admin', 'instructor', 'student')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. INSTRUCTORS Table (Extended profile info)
CREATE TABLE instructors (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE, -- Link to login
    full_name text NOT NULL, -- Denormalized for easy access
    email text,
    phone text,
    bio text,
    license_number text,
    status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at timestamptz DEFAULT now()
);

-- 3. CLASSES Table (Theory Sessions)
-- Represents a "10-day Monday-Friday 2 week session"
CREATE TABLE classes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL, -- e.g. "Feb 1-14 Session"
    start_date date NOT NULL,
    end_date date NOT NULL,
    time_slot text, -- e.g. "10:00 AM - 12:00 PM"
    instructor_id uuid REFERENCES instructors(id) ON DELETE SET NULL,
    status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
    created_at timestamptz DEFAULT now()
);

-- 4. DRIVING_SESSIONS Table (Behind-the-Wheel)
-- Represents a single driving appointment
CREATE TABLE driving_sessions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid REFERENCES profiles(id) ON DELETE CASCADE, -- Student profile (even if they don't login)
    instructor_id uuid REFERENCES instructors(id) ON DELETE SET NULL,
    start_time timestamptz NOT NULL,
    end_time timestamptz NOT NULL,
    status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    notes text, -- Instructor notes
    created_at timestamptz DEFAULT now()
);

-- 5. TRIGGER: Auto-create Profile on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE driving_sessions ENABLE ROW LEVEL SECURITY;

-- Helper Functions
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_instructor()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'instructor');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Admins view all profiles" ON profiles FOR SELECT USING (is_admin());
CREATE POLICY "Instructors view student profiles" ON profiles FOR SELECT USING (is_instructor() AND role = 'student');
CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

-- Instructors Policies
CREATE POLICY "Admins manage instructors" ON instructors USING (is_admin());
CREATE POLICY "Instructors view self" ON instructors FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Instructors view all (for schedule)" ON instructors FOR SELECT USING (is_instructor()); -- Maybe needed?

-- Classes Policies
CREATE POLICY "Admins manage classes" ON classes USING (is_admin());
CREATE POLICY "Instructors view classes" ON classes FOR SELECT USING (is_instructor());

-- Driving Sessions Policies
CREATE POLICY "Admins manage sessions" ON driving_sessions USING (is_admin());
CREATE POLICY "Instructors view assigned sessions" ON driving_sessions FOR SELECT USING (
    instructor_id IN (SELECT id FROM instructors WHERE profile_id = auth.uid())
);
CREATE POLICY "Instructors update assigned sessions" ON driving_sessions FOR UPDATE USING (
    instructor_id IN (SELECT id FROM instructors WHERE profile_id = auth.uid())
);

-- Grant Permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON instructors TO authenticated;
GRANT ALL ON classes TO authenticated;
GRANT ALL ON driving_sessions TO authenticated;
GRANT ALL ON profiles TO service_role;
GRANT ALL ON instructors TO service_role;
GRANT ALL ON classes TO service_role;
GRANT ALL ON driving_sessions TO service_role;

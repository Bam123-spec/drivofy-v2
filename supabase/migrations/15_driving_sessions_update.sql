-- 1. Create Vehicles Table (Optional but good for future)
CREATE TABLE IF NOT EXISTS vehicles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL, -- e.g. "Toyota Corolla (Red)"
    license_plate text,
    status text DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'retired')),
    created_at timestamptz DEFAULT now()
);

-- 2. Update Driving Sessions Table
ALTER TABLE driving_sessions 
ADD COLUMN IF NOT EXISTS vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS duration_minutes integer, -- Store explicitly for easier stats
ADD COLUMN IF NOT EXISTS source text DEFAULT 'admin', -- 'admin', 'student_portal', etc.
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_driving_sessions_instructor_start ON driving_sessions(instructor_id, start_time);
CREATE INDEX IF NOT EXISTS idx_driving_sessions_student_start ON driving_sessions(student_id, start_time);
CREATE INDEX IF NOT EXISTS idx_driving_sessions_status_start ON driving_sessions(status, start_time);

-- 3. Student Requirements Table
CREATE TABLE IF NOT EXISTS student_requirements (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    required_hours numeric DEFAULT 6.0, -- Default 6 hours
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(student_id)
);

-- 4. Instructor Availability Table
CREATE TABLE IF NOT EXISTS instructor_availability (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    instructor_id uuid REFERENCES instructors(id) ON DELETE CASCADE NOT NULL,
    day_of_week integer CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    start_time time NOT NULL,
    end_time time NOT NULL,
    is_recurring boolean DEFAULT true,
    effective_date date, -- If not recurring, specific date
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 5. RLS Policies (Admin Focus)

-- Vehicles
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage vehicles" ON vehicles USING (is_admin());
CREATE POLICY "Instructors view vehicles" ON vehicles FOR SELECT USING (is_instructor());

-- Student Requirements
ALTER TABLE student_requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage requirements" ON student_requirements USING (is_admin());
CREATE POLICY "Students view own requirements" ON student_requirements FOR SELECT USING (auth.uid() = student_id);

-- Instructor Availability
ALTER TABLE instructor_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage availability" ON instructor_availability USING (is_admin());
CREATE POLICY "Instructors manage own availability" ON instructor_availability USING (
    instructor_id IN (SELECT id FROM instructors WHERE profile_id = auth.uid())
);

-- Grant Permissions
GRANT ALL ON vehicles TO authenticated;
GRANT ALL ON student_requirements TO authenticated;
GRANT ALL ON instructor_availability TO authenticated;
GRANT ALL ON vehicles TO service_role;
GRANT ALL ON student_requirements TO service_role;
GRANT ALL ON instructor_availability TO service_role;

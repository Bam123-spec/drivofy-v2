-- Operations Schema
-- Adds Enrollments, Attendance, and Certifications

-- 1. ENROLLMENTS Table
-- Tracks which student is enrolled in which class
CREATE TABLE IF NOT EXISTS enrollments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
    student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    enrolled_at timestamptz DEFAULT now(),
    status text DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'dropped', 'failed')),
    UNIQUE(class_id, student_id)
);

-- 2. ATTENDANCE Table
-- Tracks daily attendance for a student in a class
CREATE TABLE IF NOT EXISTS attendance (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
    student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    date date NOT NULL,
    status text DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'excused')),
    notes text,
    created_at timestamptz DEFAULT now(),
    UNIQUE(class_id, student_id, date)
);

-- 3. CERTIFICATIONS Table
-- Tracks issued certificates
CREATE TABLE IF NOT EXISTS certifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    type text NOT NULL, -- e.g. "Theory Completion", "Behind-the-Wheel Completion"
    issued_date date DEFAULT CURRENT_DATE,
    certificate_number text UNIQUE, -- e.g. "CERT-2024-001"
    status text DEFAULT 'valid' CHECK (status IN ('valid', 'revoked')),
    created_at timestamptz DEFAULT now()
);

-- 4. RLS Policies

-- Enrollments
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage enrollments" ON enrollments USING (is_admin());
CREATE POLICY "Instructors view enrollments for their classes" ON enrollments FOR SELECT USING (
    class_id IN (SELECT id FROM classes WHERE instructor_id IN (SELECT id FROM instructors WHERE profile_id = auth.uid()))
);

-- Attendance
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage attendance" ON attendance USING (is_admin());
CREATE POLICY "Instructors manage attendance for their classes" ON attendance USING (
    class_id IN (SELECT id FROM classes WHERE instructor_id IN (SELECT id FROM instructors WHERE profile_id = auth.uid()))
);

-- Certifications
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage certifications" ON certifications USING (is_admin());
CREATE POLICY "Instructors view certifications" ON certifications FOR SELECT USING (is_instructor());

-- Grant Permissions
GRANT ALL ON enrollments TO authenticated;
GRANT ALL ON attendance TO authenticated;
GRANT ALL ON certifications TO authenticated;
GRANT ALL ON enrollments TO service_role;
GRANT ALL ON attendance TO service_role;
GRANT ALL ON certifications TO service_role;

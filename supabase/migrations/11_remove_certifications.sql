-- Remove Certifications Table
DROP TABLE IF EXISTS certifications CASCADE;

-- Ensure Enrollments and Attendance are fully functional
-- (Re-applying policies just in case, though 09 should have covered it)

-- Enrollments Policies (Idempotent-ish check)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'enrollments' AND policyname = 'Admins manage enrollments'
    ) THEN
        ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Admins manage enrollments" ON enrollments USING (is_admin());
        CREATE POLICY "Instructors view enrollments for their classes" ON enrollments FOR SELECT USING (
            class_id IN (SELECT id FROM classes WHERE instructor_id IN (SELECT id FROM instructors WHERE profile_id = auth.uid()))
        );
    END IF;
END
$$;

-- Attendance Policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'attendance' AND policyname = 'Admins manage attendance'
    ) THEN
        ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Admins manage attendance" ON attendance USING (is_admin());
        CREATE POLICY "Instructors manage attendance for their classes" ON attendance USING (
            class_id IN (SELECT id FROM classes WHERE instructor_id IN (SELECT id FROM instructors WHERE profile_id = auth.uid()))
        );
    END IF;
END
$$;

-- Grant Permissions
GRANT ALL ON enrollments TO authenticated;
GRANT ALL ON attendance TO authenticated;
GRANT ALL ON enrollments TO service_role;
GRANT ALL ON attendance TO service_role;

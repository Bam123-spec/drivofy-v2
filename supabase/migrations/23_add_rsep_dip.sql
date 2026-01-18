-- Migration: Add RSEP and DIP support

-- 1. Add class_type to classes table
ALTER TABLE classes 
ADD COLUMN IF NOT EXISTS class_type text DEFAULT 'DE' CHECK (class_type IN ('DE', 'RSEP', 'DIP'));

-- 2. Add payment_status to enrollments table
ALTER TABLE enrollments 
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed'));

-- 3. Create certificates table
CREATE TABLE IF NOT EXISTS certificates (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
    certificate_url text NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE(student_id, class_id)
);

-- 4. Enable RLS on certificates
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for certificates

-- Admins can do everything
CREATE POLICY "Admins manage certificates" ON certificates
    USING (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Students can view their own certificates
CREATE POLICY "Students view own certificates" ON certificates
    FOR SELECT USING (student_id = auth.uid());

-- Instructors can view certificates for their classes
CREATE POLICY "Instructors view certificates for their classes" ON certificates
    FOR SELECT USING (
        class_id IN (
            SELECT id FROM classes 
            WHERE instructor_id IN (SELECT id FROM instructors WHERE profile_id = auth.uid())
        )
    );

-- Reload schema cache
NOTIFY pgrst, 'reload schema';

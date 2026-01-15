-- 1. Instructor Breaks (Recurring)
CREATE TABLE IF NOT EXISTS instructor_breaks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    instructor_id uuid REFERENCES instructors(id) ON DELETE CASCADE NOT NULL,
    day_of_week integer CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday
    start_time time NOT NULL,
    end_time time NOT NULL,
    type text DEFAULT 'break', -- 'lunch', 'admin', 'personal'
    created_at timestamptz DEFAULT now()
);

-- 2. Instructor Time Off (One-off)
CREATE TABLE IF NOT EXISTS instructor_time_off (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    instructor_id uuid REFERENCES instructors(id) ON DELETE CASCADE NOT NULL,
    start_date timestamptz NOT NULL,
    end_date timestamptz NOT NULL,
    reason text,
    created_at timestamptz DEFAULT now()
);

-- 3. Session Reports (Feedback)
CREATE TABLE IF NOT EXISTS session_reports (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id uuid REFERENCES driving_sessions(id) ON DELETE CASCADE UNIQUE NOT NULL,
    skills_rated jsonb, -- { "steering": 4, "parking": 3 }
    improvements text,
    homework text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 4. RLS Policies

-- Instructor Breaks
ALTER TABLE instructor_breaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Instructors manage own breaks" ON instructor_breaks USING (
    instructor_id IN (SELECT id FROM instructors WHERE profile_id = auth.uid())
);
CREATE POLICY "Admins manage breaks" ON instructor_breaks USING (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Instructor Time Off
ALTER TABLE instructor_time_off ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Instructors manage own time off" ON instructor_time_off USING (
    instructor_id IN (SELECT id FROM instructors WHERE profile_id = auth.uid())
);
CREATE POLICY "Admins manage time off" ON instructor_time_off USING (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Session Reports
ALTER TABLE session_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Instructors manage own reports" ON session_reports USING (
    session_id IN (
        SELECT id FROM driving_sessions 
        WHERE instructor_id IN (SELECT id FROM instructors WHERE profile_id = auth.uid())
    )
);
CREATE POLICY "Students view own reports" ON session_reports FOR SELECT USING (
    session_id IN (
        SELECT id FROM driving_sessions WHERE student_id = auth.uid()
    )
);
CREATE POLICY "Admins manage reports" ON session_reports USING (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Grant Permissions
GRANT ALL ON instructor_breaks TO authenticated;
GRANT ALL ON instructor_time_off TO authenticated;
GRANT ALL ON session_reports TO authenticated;
GRANT ALL ON instructor_breaks TO service_role;
GRANT ALL ON instructor_time_off TO service_role;
GRANT ALL ON session_reports TO service_role;

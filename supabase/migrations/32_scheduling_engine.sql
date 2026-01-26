-- Migration: Scheduling Engine Database Changes
-- Description: Extend instructors, add service_packages, and update driving_sessions.

-- 1. Extend instructors table with availability rules
ALTER TABLE instructors
ADD COLUMN IF NOT EXISTS working_days smallint[] DEFAULT '{1,2,3,4,5}', -- 1=Monday to 5=Friday default
ADD COLUMN IF NOT EXISTS start_time text DEFAULT '7:00 AM',
ADD COLUMN IF NOT EXISTS end_time text DEFAULT '7:00 PM',
ADD COLUMN IF NOT EXISTS slot_minutes integer DEFAULT 60Check (slot_minutes IN (60, 120)),
ADD COLUMN IF NOT EXISTS break_start text,
ADD COLUMN IF NOT EXISTS break_end text,
ADD COLUMN IF NOT EXISTS min_notice_hours integer DEFAULT 12,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- 2. Create service_packages table
CREATE TABLE IF NOT EXISTS service_packages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_key text UNIQUE NOT NULL,
    display_name text NOT NULL,
    instructor_id uuid REFERENCES instructors(id) ON DELETE SET NULL,
    duration_minutes integer NOT NULL,
    credits_granted integer,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS for service_packages
ALTER TABLE service_packages ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies for service_packages
DROP POLICY IF EXISTS "Admins manage service packages" ON service_packages;
CREATE POLICY "Admins manage service packages" ON service_packages USING (is_admin());

DROP POLICY IF EXISTS "Everyone views service packages" ON service_packages;
CREATE POLICY "Everyone views service packages" ON service_packages FOR SELECT USING (true);

-- 3. Update driving_sessions table
ALTER TABLE driving_sessions
ADD COLUMN IF NOT EXISTS plan_key text REFERENCES service_packages(plan_key) ON DELETE SET NULL;

-- Ensure driving_sessions has necessary columns (some might already exist from migration 15)
-- start_time, end_time, status, instructor_id are already present in the original core schema or migration 15.

-- Index for plan_key performance
CREATE INDEX IF NOT EXISTS idx_driving_sessions_plan_key ON driving_sessions(plan_key);

-- Grant permissions
GRANT ALL ON service_packages TO authenticated;
GRANT ALL ON service_packages TO service_role;

-- Add package columns to classes table
ALTER TABLE classes
ADD COLUMN IF NOT EXISTS package_hours numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS package_sessions integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS package_session_duration integer DEFAULT 120; -- in minutes

-- Add credit balance columns to profiles table (for students)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS driving_balance_hours numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS driving_balance_sessions integer DEFAULT 0;

-- Add comment for clarity
COMMENT ON COLUMN classes.package_hours IS 'Total driving hours granted upon graduation';
COMMENT ON COLUMN classes.package_sessions IS 'Total driving sessions granted upon graduation';
COMMENT ON COLUMN profiles.driving_balance_hours IS 'Current balance of driving hours available to book';

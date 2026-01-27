-- Ensure updated_at column exists on enrollments
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Reload PostgREST schema cache to ensure it picks up the column
NOTIFY pgrst, 'reload schema';

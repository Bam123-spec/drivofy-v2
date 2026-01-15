-- Add grade and certification_status to enrollments
alter table enrollments add column if not exists grade text;
alter table enrollments add column if not exists certification_status text default 'pending'; -- 'pending', 'certified', 'honors'

-- Reload schema cache
NOTIFY pgrst, 'reload schema';

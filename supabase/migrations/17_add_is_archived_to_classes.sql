-- Add is_archived column to classes table
alter table classes add column if not exists is_archived boolean not null default false;

-- Index for performance when filtering by archived status
create index if not exists idx_classes_is_archived on classes(is_archived);

-- Reload schema cache
NOTIFY pgrst, 'reload schema';

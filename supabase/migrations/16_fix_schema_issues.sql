-- ==========================================
-- 1. FIX ENROLLMENTS TABLE
-- ==========================================
create table if not exists enrollments (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table enrollments add column if not exists student_id uuid references profiles(id) on delete cascade;
alter table enrollments add column if not exists class_id uuid references classes(id) on delete cascade;
alter table enrollments add column if not exists status text default 'active' check (status in ('active', 'completed', 'dropped', 'refunded'));
alter table enrollments add column if not exists enrolled_at timestamptz default now();

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'enrollments_student_id_class_id_key') then
    alter table enrollments add constraint enrollments_student_id_class_id_key unique(student_id, class_id);
  end if;
end $$;

create index if not exists idx_enrollments_class on enrollments(class_id);
create index if not exists idx_enrollments_student on enrollments(student_id);

alter table enrollments enable row level security;

drop policy if exists "Admins can do everything on enrollments" on enrollments;
create policy "Admins can do everything on enrollments" on enrollments
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ==========================================
-- 2. FIX CLASSES TABLE
-- ==========================================
alter table classes add column if not exists daily_start_time time;
alter table classes add column if not exists daily_end_time time;
alter table classes add column if not exists start_date date;
alter table classes add column if not exists end_date date;
alter table classes add column if not exists repeat_every_weeks integer;
alter table classes add column if not exists status text default 'active';

-- ==========================================
-- 3. FIX CLASS_DAYS TABLE
-- ==========================================
create table if not exists class_days (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table class_days add column if not exists class_id uuid references classes(id) on delete cascade;
alter table class_days add column if not exists date date;
alter table class_days add column if not exists start_datetime timestamptz;
alter table class_days add column if not exists end_datetime timestamptz;
alter table class_days add column if not exists status text default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled'));

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'class_days_class_id_date_key') then
    alter table class_days add constraint class_days_class_id_date_key unique(class_id, date);
  end if;
end $$;

create index if not exists idx_class_days_class on class_days(class_id);
create index if not exists idx_class_days_date on class_days(date);

alter table class_days enable row level security;

drop policy if exists "Admins can do everything on class_days" on class_days;
create policy "Admins can do everything on class_days" on class_days
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ==========================================
-- 4. RELOAD SCHEMA CACHE
-- ==========================================
NOTIFY pgrst, 'reload schema';

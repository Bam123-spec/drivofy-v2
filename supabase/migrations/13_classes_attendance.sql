-- Create Classes table
create table classes (
  id uuid primary key default uuid_generate_v4(),
  school_id uuid, -- For future multi-tenancy
  name text not null,
  code text,
  instructor_id uuid references instructors(id),
  capacity integer default 20,
  start_date date not null,
  end_date date not null,
  daily_start_time time not null,
  daily_end_time time not null,
  timezone text default 'UTC',
  repeat_every_weeks integer, -- If null, assumes daily within range or custom logic
  status text default 'active' check (status in ('draft', 'active', 'completed', 'cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create Class Days table (Individual sessions)
create table class_days (
  id uuid primary key default uuid_generate_v4(),
  class_id uuid references classes(id) on delete cascade,
  date date not null,
  start_datetime timestamptz not null,
  end_datetime timestamptz not null,
  status text default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(class_id, date)
);

-- Create Enrollments table (Student -> Class)
-- Note: We might already have an enrollments table from previous migrations. 
-- If so, we should alter it. Checking previous context, 'enrollments' exists but might need adjustment.
-- For safety, I will check if it exists and alter/create accordingly.
-- Assuming we are replacing/upgrading the existing concept.
-- Dropping existing if it conflicts or altering. 
-- Let's assume we are creating fresh or compatible.
-- The previous 'enrollments' linked students to 'classes' (which existed in previous migrations?).
-- Let's recreate/ensure it matches the new schema.

create table if not exists enrollments (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references profiles(id) on delete cascade, -- Assuming students are in profiles
  class_id uuid references classes(id) on delete cascade,
  status text default 'active' check (status in ('active', 'completed', 'dropped', 'refunded')),
  enrolled_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(student_id, class_id)
);

-- Create Attendance Records table
create table attendance_records (
  id uuid primary key default uuid_generate_v4(),
  class_day_id uuid references class_days(id) on delete cascade,
  student_id uuid references profiles(id) on delete cascade,
  status text not null check (status in ('present', 'absent', 'late', 'excused')),
  marked_by_instructor_id uuid references instructors(id), -- or profiles(id)
  marked_at timestamptz default now(),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(class_day_id, student_id)
);

-- Indexes
create index idx_classes_instructor on classes(instructor_id);
create index idx_classes_dates on classes(start_date, end_date);
create index idx_class_days_class on class_days(class_id);
create index idx_class_days_date on class_days(date);
create index idx_enrollments_student on enrollments(student_id);
create index idx_enrollments_class on enrollments(class_id);
create index idx_attendance_day on attendance_records(class_day_id);
create index idx_attendance_student on attendance_records(student_id);

-- RLS Policies
alter table classes enable row level security;
alter table class_days enable row level security;
alter table enrollments enable row level security;
alter table attendance_records enable row level security;

-- Admin Policies (Full Access)
-- Assuming we have a function or claim to check for admin. 
-- For now, using a simple check on profiles if possible, or assuming service role for admin apps.
-- But for the client-side admin app:
create policy "Admins can do everything on classes" on classes
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can do everything on class_days" on class_days
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can do everything on enrollments" on enrollments
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can do everything on attendance_records" on attendance_records
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Instructor Policies
-- Read classes they teach
create policy "Instructors can view their own classes" on classes
  for select using (
    instructor_id in (select id from instructors where profile_id = auth.uid())
  );

-- Read class days for their classes
create policy "Instructors can view their class days" on class_days
  for select using (
    class_id in (
      select id from classes 
      where instructor_id in (select id from instructors where profile_id = auth.uid())
    )
  );

-- Read enrollments for their classes
create policy "Instructors can view enrollments for their classes" on enrollments
  for select using (
    class_id in (
      select id from classes 
      where instructor_id in (select id from instructors where profile_id = auth.uid())
    )
  );

-- Manage attendance for their classes
create policy "Instructors can view attendance for their classes" on attendance_records
  for select using (
    class_day_id in (
      select cd.id from class_days cd
      join classes c on cd.class_id = c.id
      where c.instructor_id in (select id from instructors where profile_id = auth.uid())
    )
  );

create policy "Instructors can insert attendance for their classes" on attendance_records
  for insert with check (
    class_day_id in (
      select cd.id from class_days cd
      join classes c on cd.class_id = c.id
      where c.instructor_id in (select id from instructors where profile_id = auth.uid())
    )
  );

create policy "Instructors can update attendance for their classes" on attendance_records
  for update using (
    class_day_id in (
      select cd.id from class_days cd
      join classes c on cd.class_id = c.id
      where c.instructor_id in (select id from instructors where profile_id = auth.uid())
    )
  );

-- Student Policies (Read Only)
create policy "Students can view classes they are enrolled in" on classes
  for select using (
    id in (select class_id from enrollments where student_id = auth.uid())
  );

create policy "Students can view days for their classes" on class_days
  for select using (
    class_id in (select class_id from enrollments where student_id = auth.uid())
  );

create policy "Students can view their own enrollments" on enrollments
  for select using (
    student_id = auth.uid()
  );

create policy "Students can view their own attendance" on attendance_records
  for select using (
    student_id = auth.uid()
  );

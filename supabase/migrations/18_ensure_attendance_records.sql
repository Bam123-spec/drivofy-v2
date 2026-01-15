-- Ensure attendance_records table exists
create table if not exists attendance_records (
  id uuid primary key default uuid_generate_v4(),
  class_day_id uuid references class_days(id) on delete cascade,
  student_id uuid references profiles(id) on delete cascade,
  status text not null check (status in ('present', 'absent', 'late', 'excused')),
  marked_by_instructor_id uuid references instructors(id),
  marked_at timestamptz default now(),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(class_day_id, student_id)
);

-- Indexes
create index if not exists idx_attendance_day on attendance_records(class_day_id);
create index if not exists idx_attendance_student on attendance_records(student_id);

-- RLS
alter table attendance_records enable row level security;

-- Policies
create policy "Admins can do everything on attendance_records" on attendance_records
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

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

create policy "Students can view their own attendance" on attendance_records
  for select using (
    student_id = auth.uid()
  );

-- Reload schema cache
NOTIFY pgrst, 'reload schema';

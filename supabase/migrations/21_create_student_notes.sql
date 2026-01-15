-- Create student_notes table
create table if not exists student_notes (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references profiles(id) on delete cascade,
  instructor_id uuid references instructors(id),
  content text,
  related_session_id uuid, -- Can be driving_session_id or class_day_id
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_student_notes_student on student_notes(student_id);
create index if not exists idx_student_notes_instructor on student_notes(instructor_id);

-- RLS
alter table student_notes enable row level security;

-- Policies
create policy "Instructors can view their own notes about students" on student_notes
  for select using (
    instructor_id in (select id from instructors where profile_id = auth.uid())
  );

create policy "Instructors can insert their own notes" on student_notes
  for insert with check (
    instructor_id in (select id from instructors where profile_id = auth.uid())
  );

create policy "Instructors can update their own notes" on student_notes
  for update using (
    instructor_id in (select id from instructors where profile_id = auth.uid())
  );

create policy "Admins can view all student notes" on student_notes
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Reload schema cache
NOTIFY pgrst, 'reload schema';

-- Create lesson_notes table
create table if not exists lesson_notes (
  id uuid primary key default uuid_generate_v4(),
  class_day_id uuid references class_days(id) on delete cascade,
  instructor_id uuid references instructors(id),
  content text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_lesson_notes_day on lesson_notes(class_day_id);
create index if not exists idx_lesson_notes_instructor on lesson_notes(instructor_id);

-- RLS
alter table lesson_notes enable row level security;

-- Policies
create policy "Instructors can view their own notes" on lesson_notes
  for select using (
    instructor_id in (select id from instructors where profile_id = auth.uid())
  );

create policy "Instructors can insert their own notes" on lesson_notes
  for insert with check (
    instructor_id in (select id from instructors where profile_id = auth.uid())
  );

create policy "Instructors can update their own notes" on lesson_notes
  for update using (
    instructor_id in (select id from instructors where profile_id = auth.uid())
  );

create policy "Admins can view all notes" on lesson_notes
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Reload schema cache
NOTIFY pgrst, 'reload schema';

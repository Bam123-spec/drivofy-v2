-- Enable pgcrypto if not already enabled (useful for future encryption, though we rely on RLS for now)
create extension if not exists "pgcrypto";

-- Create Google Tokens table
create table instructor_google_tokens (
  id uuid primary key default uuid_generate_v4(),
  instructor_id uuid references instructors(id) on delete cascade not null,
  access_token text not null,
  refresh_token text not null,
  expiry_timestamp timestamptz not null,
  email text, -- To show which account is connected
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(instructor_id)
);

-- RLS Policies
alter table instructor_google_tokens enable row level security;

-- Instructor Policies
-- Instructors can read/write their own tokens
create policy "Instructors can view their own google tokens" on instructor_google_tokens
  for select using (
    instructor_id in (select id from instructors where profile_id = auth.uid())
  );

create policy "Instructors can insert their own google tokens" on instructor_google_tokens
  for insert with check (
    instructor_id in (select id from instructors where profile_id = auth.uid())
  );

create policy "Instructors can update their own google tokens" on instructor_google_tokens
  for update using (
    instructor_id in (select id from instructors where profile_id = auth.uid())
  );

create policy "Instructors can delete their own google tokens" on instructor_google_tokens
  for delete using (
    instructor_id in (select id from instructors where profile_id = auth.uid())
  );

-- Admin Policies
-- Admins can view tokens for debugging (optional, maybe restrict to just existence check)
create policy "Admins can view all google tokens" on instructor_google_tokens
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

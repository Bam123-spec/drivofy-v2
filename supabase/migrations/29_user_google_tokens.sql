-- Create User Google Tokens table (generalized from instructor_google_tokens)
create table if not exists user_google_tokens (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade not null,
  access_token text not null,
  refresh_token text,
  expiry_timestamp timestamptz not null,
  email text, -- To show which account is connected
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(profile_id)
);

-- RLS Policies
alter table user_google_tokens enable row level security;

-- Profile Policies (Users manage their own tokens)
create policy "Users can view their own google tokens" on user_google_tokens
  for select using (auth.uid() = profile_id);

create policy "Users can insert their own google tokens" on user_google_tokens
  for insert with check (auth.uid() = profile_id);

create policy "Users can update their own google tokens" on user_google_tokens
  for update using (auth.uid() = profile_id);

create policy "Users can delete their own google tokens" on user_google_tokens
  for delete using (auth.uid() = profile_id);

-- Admin Policies
create policy "Admins can view all user google tokens" on user_google_tokens
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Migrate existing instructor tokens if any
insert into user_google_tokens (profile_id, access_token, refresh_token, expiry_timestamp, email, created_at, updated_at)
select 
  instructors.profile_id, 
  igt.access_token, 
  igt.refresh_token, 
  igt.expiry_timestamp, 
  igt.email, 
  igt.created_at, 
  igt.updated_at
from instructor_google_tokens igt
join instructors on instructors.id = igt.instructor_id
on conflict (profile_id) do nothing;

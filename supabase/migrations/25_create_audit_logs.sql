-- Create Audit Logs table
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  user_id uuid references profiles(id) on delete set null,
  action text not null,
  details jsonb default '{}'::jsonb,
  ip_address text,
  target_resource text
);

-- Enable RLS
alter table audit_logs enable row level security;

-- Policies
-- Only admins can view audit logs
create policy "Admins can view audit logs" on audit_logs
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- System or authenticated users can insert logs (via server actions usually)
-- We might want to restrict this, but for now allow authenticated to insert their own actions
create policy "Authenticated users can insert audit logs" on audit_logs
  for insert with check (
    auth.uid() = user_id
  );

-- Grant permissions
grant all on audit_logs to authenticated;
grant all on audit_logs to service_role;

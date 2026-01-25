alter table public.organizations
  add column if not exists stripe_account_id text,
  add column if not exists stripe_connected_at timestamptz,
  add column if not exists stripe_status text default 'disconnected';

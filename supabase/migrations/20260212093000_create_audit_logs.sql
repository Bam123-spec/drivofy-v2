create extension if not exists pgcrypto;

create table if not exists public.audit_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid null references public.profiles (id) on delete set null,
    action text not null,
    details jsonb not null default '{}'::jsonb,
    ip_address text null,
    target_resource text null,
    entity_type text null,
    entity_id uuid null,
    metadata jsonb not null default '{}'::jsonb,
    message text null,
    created_at timestamptz not null default now()
);

alter table public.audit_logs add column if not exists user_id uuid null;
alter table public.audit_logs add column if not exists action text;
alter table public.audit_logs add column if not exists details jsonb not null default '{}'::jsonb;
alter table public.audit_logs add column if not exists ip_address text null;
alter table public.audit_logs add column if not exists target_resource text null;
alter table public.audit_logs add column if not exists entity_type text null;
alter table public.audit_logs add column if not exists entity_id uuid null;
alter table public.audit_logs add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.audit_logs add column if not exists message text null;
alter table public.audit_logs add column if not exists created_at timestamptz not null default now();

create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);
create index if not exists audit_logs_user_id_idx on public.audit_logs (user_id);
create index if not exists audit_logs_action_idx on public.audit_logs (action);
create index if not exists audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);

alter table public.audit_logs enable row level security;

drop policy if exists "audit_logs_insert_authenticated" on public.audit_logs;
create policy "audit_logs_insert_authenticated"
on public.audit_logs
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "audit_logs_select_authenticated" on public.audit_logs;
create policy "audit_logs_select_authenticated"
on public.audit_logs
for select
to authenticated
using (true);

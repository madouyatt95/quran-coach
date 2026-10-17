-- Private, opt-in progress vault. Client payloads must be encrypted before upload.
-- No anonymous access, no sharing links, no service key in the application.
create table if not exists public.qc_private_progress (
 user_id uuid primary key references auth.users(id) on delete cascade,
 revision bigint not null default 1 check (revision > 0),
 payload jsonb not null check (jsonb_typeof(payload) = 'object' and payload->>'format' = 'qc-encrypted-progress-v1'),
 updated_at timestamptz not null default now(),
 constraint qc_progress_size check (octet_length(payload::text) <= 33554432)
);
alter table public.qc_private_progress enable row level security;
revoke all on public.qc_private_progress from anon;
grant select, insert, update, delete on public.qc_private_progress to authenticated;
create policy "progress owner select" on public.qc_private_progress for select to authenticated using ((select auth.uid()) = user_id);
create policy "progress owner insert" on public.qc_private_progress for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "progress owner update" on public.qc_private_progress for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "progress owner delete" on public.qc_private_progress for delete to authenticated using ((select auth.uid()) = user_id);

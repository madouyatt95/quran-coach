-- Server-only production tables. Supabase anon/authenticated cannot write or read drafts.
create table public.qc_audio_accounts (
 id text primary key check (id ~ '^[a-z0-9_-]{1,40}$'), label text not null,
 enabled boolean not null default false, terms_confirmed_at timestamptz not null,
 authorized_until timestamptz not null, credit_limit integer not null check (credit_limit >= 0),
 spent integer not null default 0 check (spent >= 0), reserved integer not null default 0 check (reserved >= 0)
);
create table public.qc_audio_scripts (
 id text primary key, title text not null, category text not null check (category in ('prophet','story','academy','invocation','journey','tafsir')),
 text text not null check (char_length(text) between 1 and 4000), original_text text not null,
 source_url text not null, reference text not null, rights text not null,
 approved_by uuid, approved_at timestamptz, created_at timestamptz not null default now()
);
create table public.qc_audio_voices (id text primary key, config jsonb not null, created_at timestamptz not null default now());
create table public.qc_audio_quotes (
 id uuid primary key default gen_random_uuid(), account_id text not null references public.qc_audio_accounts,
 items jsonb not null, estimated integer not null, ceiling integer not null,
 created_by uuid not null, created_at timestamptz not null default now(), expires_at timestamptz not null default (now() + interval '15 minutes')
);
create table public.qc_audio_batches (
 id uuid primary key references public.qc_audio_quotes, account_id text not null references public.qc_audio_accounts,
 approved_by uuid not null, approved_at timestamptz not null default now(), ceiling integer not null, paused boolean not null default false
);
create table public.qc_audio_jobs (
 id uuid primary key default gen_random_uuid(), fingerprint text not null unique,
 batch_id uuid not null references public.qc_audio_batches, account_id text not null references public.qc_audio_accounts,
 script_id text not null references public.qc_audio_scripts, voice jsonb not null,
 state text not null default 'queued' check (state in ('queued','generating','uncertain','review','published','rejected','cancelled')),
 estimate integer not null, reserved integer not null, actual integer,
 request_id text, history_id text, error text, started_at timestamptz, finished_at timestamptz,
 artifact jsonb, created_at timestamptz not null default now(), reviewed_by uuid, reviewed_at timestamptz
);
create table public.qc_audio_events (
 id bigint generated always as identity primary key, at timestamptz not null default now(), actor text not null,
 action text not null, entity text not null, detail jsonb not null default '{}'
);
create index qc_audio_jobs_batch on public.qc_audio_jobs(batch_id, created_at);
-- At most one charge can be in flight per account, including across multiple workflows.
create unique index qc_audio_account_inflight on public.qc_audio_jobs(account_id) where state='generating';
do $$ declare t text; begin
 foreach t in array array['accounts','scripts','voices','quotes','batches','jobs','events'] loop
  execute format('alter table public.%I enable row level security','qc_audio_'||t);
  execute format('revoke all on public.%I from anon, authenticated','qc_audio_'||t);
  execute format('grant all on public.%I to service_role','qc_audio_'||t);
 end loop;
end $$;
grant usage,select on sequence public.qc_audio_events_id_seq to service_role;

-- Approval and reservation are atomic. A replay returns the original batch.
create function public.qc_audio_approve(p_quote uuid,p_actor uuid,p_available integer) returns uuid
language plpgsql security definer set search_path=public,pg_temp as $$
declare q qc_audio_quotes; a qc_audio_accounts; item jsonb;
begin
 select * into strict q from qc_audio_quotes where id=p_quote for update;
 if exists(select 1 from qc_audio_batches where id=q.id) then return q.id; end if;
 if q.expires_at<now() or q.created_by<>p_actor then raise exception 'Quote expired or wrong owner'; end if;
 select * into strict a from qc_audio_accounts where id=q.account_id for update;
 if not a.enabled or a.authorized_until<=now() then raise exception 'Account not authorized'; end if;
 if a.spent+a.reserved+q.ceiling>a.credit_limit or a.reserved+q.ceiling>p_available then raise exception 'Credit ceiling exceeded'; end if;
 insert into qc_audio_batches(id,account_id,approved_by,ceiling) values(q.id,a.id,p_actor,q.ceiling);
 for item in select * from jsonb_array_elements(q.items) loop
  if not exists(select 1 from qc_audio_scripts where id=item->>'script_id' and approved_by is not null) then raise exception 'Unapproved script'; end if;
  insert into qc_audio_jobs(fingerprint,batch_id,account_id,script_id,voice,estimate,reserved)
  values(item->>'fingerprint',q.id,a.id,item->>'script_id',item->'voice',(item->>'estimate')::integer,(item->>'reserved')::integer);
 end loop;
 update qc_audio_accounts set reserved=reserved+q.ceiling where id=a.id;
 insert into qc_audio_events(actor,action,entity,detail) values(p_actor::text,'approve_batch',q.id::text,jsonb_build_object('account',a.id,'ceiling',q.ceiling));
 return q.id;
end $$;

create function public.qc_audio_claim(p_job uuid) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare j qc_audio_jobs; a qc_audio_accounts; b qc_audio_batches;
begin
 select * into strict j from qc_audio_jobs where id=p_job;
 select * into strict b from qc_audio_batches where id=j.batch_id for update;
 select * into strict a from qc_audio_accounts where id=b.account_id for update;
 select * into strict j from qc_audio_jobs where id=p_job for update;
 if j.state<>'queued' or b.paused or not a.enabled or a.authorized_until<=now() then return null; end if;
 if exists(select 1 from qc_audio_jobs where account_id=a.id and state in ('generating','uncertain')) then return null; end if;
 update qc_audio_jobs set state='generating',started_at=now(),error=null where id=j.id returning * into j;
 insert into qc_audio_events(actor,action,entity) values('worker','claim',j.id::text);
 return to_jsonb(j);
end $$;

-- Terminal accounting is idempotent and preserves reservations when the charge is unknown.
create function public.qc_audio_finish(p_job uuid,p_artifact jsonb,p_actual integer) returns void
language plpgsql security definer set search_path=public,pg_temp as $$
declare j qc_audio_jobs;
begin
 select * into strict j from qc_audio_jobs where id=p_job for update;
 if j.state not in ('generating','uncertain') then return; end if;
 if p_actual is not null and p_actual<0 then raise exception 'Invalid cost'; end if;
 update qc_audio_jobs set state='review',artifact=p_artifact,actual=p_actual,finished_at=now(),error=null where id=j.id;
 if p_actual is not null then
  update qc_audio_accounts set reserved=reserved-j.reserved,spent=spent+p_actual,
    enabled=enabled and p_actual<=j.reserved where id=j.account_id;
 end if;
 insert into qc_audio_events(actor,action,entity,detail) values('worker','generated',j.id::text,jsonb_build_object('actual',p_actual));
end $$;

create function public.qc_audio_settle(p_job uuid,p_actual integer) returns void
language plpgsql security definer set search_path=public,pg_temp as $$
declare j qc_audio_jobs;
begin
 select * into strict j from qc_audio_jobs where id=p_job for update;
 if j.actual is not null or j.artifact is null then return; end if;
 if p_actual<0 then raise exception 'Invalid cost'; end if;
 update qc_audio_accounts set reserved=reserved-j.reserved,spent=spent+p_actual,enabled=enabled and p_actual<=j.reserved where id=j.account_id;
 update qc_audio_jobs set actual=p_actual where id=j.id;
end $$;

-- Only unstarted jobs may move; uncertain/charged attempts remain attached to their original account.
create function public.qc_audio_transfer(p_batch uuid,p_account text,p_actor uuid,p_available integer) returns void
language plpgsql security definer set search_path=public,pg_temp as $$
declare b qc_audio_batches; a qc_audio_accounts; amount integer;
begin
 select * into strict b from qc_audio_batches where id=p_batch for update;
 if exists(select 1 from qc_audio_jobs where batch_id=b.id and state='generating') then raise exception 'Wait for active generation'; end if;
 if b.account_id=p_account then raise exception 'Choose a different account'; end if;
 perform 1 from qc_audio_accounts where id in(b.account_id,p_account) order by id for update;
 select * into strict a from qc_audio_accounts where id=p_account;
 select coalesce(sum(reserved),0) into amount from qc_audio_jobs where batch_id=b.id and state='queued';
 if amount=0 or not a.enabled or a.authorized_until<=now() or a.reserved+a.spent+amount>a.credit_limit or a.reserved+amount>p_available then raise exception 'Account or quota unavailable'; end if;
 update qc_audio_accounts set reserved=reserved-amount where id=b.account_id;
 update qc_audio_accounts set reserved=reserved+amount where id=a.id;
 update qc_audio_jobs set account_id=a.id where batch_id=b.id and state='queued';
 update qc_audio_batches set account_id=a.id,paused=true where id=b.id;
 insert into qc_audio_events(actor,action,entity,detail) values(p_actor::text,'account_transfer',b.id::text,jsonb_build_object('from',b.account_id,'to',a.id,'reserved',amount));
end $$;

-- Functions default to PUBLIC execution in PostgreSQL: explicitly remove it.
revoke all on function public.qc_audio_approve(uuid,uuid,integer),public.qc_audio_claim(uuid),public.qc_audio_finish(uuid,jsonb,integer),public.qc_audio_settle(uuid,integer),public.qc_audio_transfer(uuid,text,uuid,integer) from public,anon,authenticated;
grant execute on function public.qc_audio_approve(uuid,uuid,integer),public.qc_audio_claim(uuid),public.qc_audio_finish(uuid,jsonb,integer),public.qc_audio_settle(uuid,integer),public.qc_audio_transfer(uuid,text,uuid,integer) to service_role;

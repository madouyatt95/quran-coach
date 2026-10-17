-- Synthetic accounts and payloads are always rolled back. No real progress is accessed.
begin;
insert into auth.users (id) values ('e93f1a00-0000-4000-8000-000000000001'), ('e93f1a00-0000-4000-8000-000000000002');
insert into public.qc_private_progress (user_id,payload) values
('e93f1a00-0000-4000-8000-000000000001','{"format":"qc-encrypted-progress-v1","ciphertext":"synthetic-a"}'),
('e93f1a00-0000-4000-8000-000000000002','{"format":"qc-encrypted-progress-v1","ciphertext":"synthetic-b"}');
set local role authenticated;
select set_config('request.jwt.claim.sub','e93f1a00-0000-4000-8000-000000000001',true);
do $$
declare n integer;
begin
 select count(*) into n from public.qc_private_progress;
 if n <> 1 then raise exception 'RLS read isolation failed'; end if;
 update public.qc_private_progress set revision=2 where user_id='e93f1a00-0000-4000-8000-000000000002';
 get diagnostics n = row_count;
 if n <> 0 then raise exception 'RLS cross-account update allowed'; end if;
 begin
  insert into public.qc_private_progress(user_id,payload) values('e93f1a00-0000-4000-8000-000000000002','{"format":"qc-encrypted-progress-v1"}');
  raise exception 'RLS cross-account insert allowed';
 exception when insufficient_privilege then null;
 end;
 update public.qc_private_progress set revision=2 where user_id=auth.uid() and revision=1;
 get diagnostics n = row_count;
 if n <> 1 then raise exception 'Owner update failed'; end if;
 update public.qc_private_progress set revision=3 where user_id=auth.uid() and revision=1;
 get diagnostics n = row_count;
 if n <> 0 then raise exception 'Stale revision update allowed'; end if;
end $$;
reset role;
set local role anon;
do $$
begin
 begin
  perform 1 from public.qc_private_progress;
  raise exception 'Anonymous access allowed';
 exception when insufficient_privilege then null;
 end;
end $$;
reset role;
rollback;
select 'PASS: owner only, foreign insert/update blocked, stale revision blocked, anonymous blocked; synthetic data rolled back' as verification;

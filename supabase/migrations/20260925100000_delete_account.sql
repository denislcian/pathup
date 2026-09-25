-- PathUp · delete my account
-- The GDPR right to erasure, from the app: a signed-in user can delete their own account and,
-- because every table hangs off auth.users with "on delete cascade", every row they own goes
-- with it (profile, workouts, routines, measurements, programmes and check-ins).
-- security definer is needed because users cannot delete from auth.users themselves; the function
-- only ever deletes the caller.

create function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
begin
  if caller is null then
    raise exception 'Not signed in' using errcode = '42501';
  end if;

  delete from auth.users where id = caller;
end;
$$;

comment on function public.delete_my_account() is 'Deletes the calling user and, by cascade, all their data.';

revoke all on function public.delete_my_account() from public;
revoke all on function public.delete_my_account() from anon;
grant execute on function public.delete_my_account() to authenticated;

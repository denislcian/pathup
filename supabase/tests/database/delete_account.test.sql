begin;
create extension if not exists pgtap with schema extensions;

select plan(6);

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'ana@test.dev', '{"birth_date": "1995-03-01"}'),
  ('22222222-2222-2222-2222-222222222222', 'bea@test.dev', '{"birth_date": "1990-07-15"}');

insert into public.workouts (id, user_id, name, started_at) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Torso', now()),
  ('aaaaaaaa-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'Pierna', now());

-- Anonymous visitors cannot call it at all ------------------------------------------------------

set local role anon;

select throws_ok(
  $$ select public.delete_my_account() $$,
  '42501',
  null,
  'an anonymous visitor cannot call the function'
);

-- Ana deletes her account -------------------------------------------------------------------------

set local role authenticated;
set local request.jwt.claims to '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select lives_ok(
  $$ select public.delete_my_account() $$,
  'a signed-in user can delete their account'
);

reset role;

select is(
  (select count(*)::int from auth.users where id = '11111111-1111-1111-1111-111111111111'),
  0,
  'the user is gone'
);

select is(
  (select count(*)::int from public.profiles where id = '11111111-1111-1111-1111-111111111111'),
  0,
  'their profile is gone'
);

select is(
  (select count(*)::int from public.workouts where user_id = '11111111-1111-1111-1111-111111111111'),
  0,
  'their workouts are gone'
);

-- Nobody else is touched ----------------------------------------------------------------------------

select is(
  (select count(*)::int from public.workouts where user_id = '22222222-2222-2222-2222-222222222222'),
  1,
  'other users keep their data'
);

select * from finish();
rollback;

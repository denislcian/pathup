begin;
create extension if not exists pgtap with schema extensions;

select plan(9);

-- Schema ---------------------------------------------------------------------------------

select has_table('public', 'profiles', 'profiles table exists');

select is(
  (select relrowsecurity from pg_class where oid = 'public.profiles'::regclass),
  true,
  'row level security is enabled on profiles'
);

-- Two adults sign up; the auth trigger creates their profiles --------------------------------

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'ana@test.dev',
   '{"display_name": "Ana", "birth_date": "1995-03-01", "health_data_consent": true}'),
  ('22222222-2222-2222-2222-222222222222', 'bea@test.dev',
   '{"display_name": "Bea", "birth_date": "1990-07-15"}');

select results_eq(
  $$ select display_name, health_data_consent_at is not null
     from public.profiles
     where id in ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222')
     order by display_name $$,
  $$ values ('Ana'::text, true), ('Bea'::text, false) $$,
  'sign-up creates a profile with the metadata and the consent timestamp'
);

-- Ana is signed in ------------------------------------------------------------------------------

set local role authenticated;
set local request.jwt.claims to '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select results_eq(
  $$ select display_name from public.profiles $$,
  $$ values ('Ana'::text) $$,
  'a user only sees their own profile'
);

update public.profiles
set display_name = 'Hacked'
where id = '22222222-2222-2222-2222-222222222222';

select throws_ok(
  $$ update public.profiles set created_at = now() - interval '1 year' $$,
  '42501',
  null,
  'users cannot change database-managed columns'
);

reset role;

select is(
  (select display_name from public.profiles where id = '22222222-2222-2222-2222-222222222222'),
  'Bea',
  'a user cannot update someone else''s profile'
);

-- Anonymous visitors ----------------------------------------------------------------------------

set local role anon;

select throws_ok(
  $$ select * from public.profiles $$,
  '42501',
  null,
  'anonymous visitors cannot read profiles'
);

reset role;

-- Age rules ---------------------------------------------------------------------------------------

select throws_ok(
  format(
    $$ insert into auth.users (id, email, raw_user_meta_data)
       values ('33333333-3333-3333-3333-333333333333', 'young@test.dev', %L) $$,
    jsonb_build_object('birth_date', (current_date - interval '15 years')::date)
  ),
  '23514',
  'PathUp requires users to be at least 16 years old',
  'sign-ups under 16 are rejected'
);

insert into auth.users (id, email, raw_user_meta_data)
values (
  '44444444-4444-4444-4444-444444444444', 'teen@test.dev',
  jsonb_build_object('birth_date', (current_date - interval '17 years')::date)
);

set local role authenticated;
set local request.jwt.claims to '{"sub": "44444444-4444-4444-4444-444444444444", "role": "authenticated"}';

update public.profiles set is_private = false;

reset role;

select is(
  (select is_private from public.profiles where id = '44444444-4444-4444-4444-444444444444'),
  true,
  'profiles of 16 and 17 year olds stay private'
);

select * from finish();
rollback;

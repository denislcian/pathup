begin;
create extension if not exists pgtap with schema extensions;

select plan(6);

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'ana@test.dev', '{"birth_date": "1995-03-01"}'),
  ('22222222-2222-2222-2222-222222222222', 'bea@test.dev', '{"birth_date": "1990-07-15"}');

set local role authenticated;
set local request.jwt.claims to '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select lives_ok(
  $$ insert into public.program_enrollments (id, user_id, program_slug)
     values ('dddddddd-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
             'primeros-pasos') $$,
  'a user can start a programme'
);

select throws_ok(
  $$ insert into public.program_enrollments (id, user_id, program_slug)
     values ('dddddddd-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
             'torso-pierna') $$,
  '23505',
  null,
  'a user cannot follow two programmes at once'
);

-- Leaving the first one frees the slot.
update public.program_enrollments set status = 'abandoned'
  where id = 'dddddddd-0000-0000-0000-000000000001';

select lives_ok(
  $$ insert into public.program_enrollments (id, user_id, program_slug)
     values ('dddddddd-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
             'torso-pierna') $$,
  'after leaving a programme another one can start'
);

-- A workout can say which session of the programme it was ---------------------------------------

select lives_ok(
  $$ insert into public.workouts (id, user_id, name, started_at, ended_at, program_slug, program_session)
     values ('aaaaaaaa-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111111',
             'Torso A', now() - interval '1 hour', now(), 'torso-pierna', 'w1-a') $$,
  'a workout can carry the programme session it belongs to'
);

select throws_ok(
  $$ insert into public.workouts (id, user_id, name, started_at, program_slug, program_session)
     values ('aaaaaaaa-0000-0000-0000-000000000011', '11111111-1111-1111-1111-111111111111',
             'Torso A', now(), 'torso-pierna', 'semana 1 dia A') $$,
  '23514',
  null,
  'a session key that is not w<week>-<letter> is rejected'
);

-- Bea cannot see Ana's programme ----------------------------------------------------------------

set local request.jwt.claims to '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';

select is(
  (select count(*)::int from public.program_enrollments),
  0,
  'another user cannot read the enrollment'
);

select * from finish();
rollback;

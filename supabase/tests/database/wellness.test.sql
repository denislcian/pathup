begin;
create extension if not exists pgtap with schema extensions;

select plan(5);

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'ana@test.dev', '{"birth_date": "1995-03-01"}'),
  ('22222222-2222-2222-2222-222222222222', 'bea@test.dev', '{"birth_date": "1990-07-15"}');

set local role authenticated;
set local request.jwt.claims to '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select lives_ok(
  $$ insert into public.wellness_checkins
       (user_id, day, sleep_hours, sleep_quality, energy, stress, soreness, mood, readiness)
     values ('11111111-1111-1111-1111-111111111111', current_date, 7.5, 4, 4, 2, 2, 4, 78) $$,
  'a user can log a check-in'
);

select lives_ok(
  $$ insert into public.wellness_checkins
       (user_id, day, sleep_hours, sleep_quality, energy, stress, soreness, mood, readiness)
     values ('11111111-1111-1111-1111-111111111111', current_date, 6, 3, 3, 3, 3, 3, 55)
     on conflict (user_id, day) do update set energy = excluded.energy, readiness = excluded.readiness $$,
  'checking in twice the same day updates the day'
);

select throws_ok(
  $$ insert into public.wellness_checkins
       (user_id, day, sleep_hours, sleep_quality, energy, stress, soreness, mood, readiness)
     values ('11111111-1111-1111-1111-111111111111', current_date - 1, 7, 9, 4, 2, 2, 4, 80) $$,
  '23514',
  null,
  'an answer outside 1-5 is rejected'
);

set local request.jwt.claims to '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';

select is(
  (select count(*)::int from public.wellness_checkins),
  0,
  'another user cannot read the check-ins'
);

select throws_ok(
  $$ insert into public.wellness_checkins
       (user_id, day, sleep_hours, sleep_quality, energy, stress, soreness, mood, readiness)
     values ('11111111-1111-1111-1111-111111111111', current_date - 2, 7, 4, 4, 2, 2, 4, 78) $$,
  '42501',
  null,
  'another user cannot check in for someone else'
);

select * from finish();
rollback;

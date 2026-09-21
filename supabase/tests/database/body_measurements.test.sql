begin;
create extension if not exists pgtap with schema extensions;

select plan(7);

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'ana@test.dev', '{"birth_date": "1995-03-01"}'),
  ('22222222-2222-2222-2222-222222222222', 'bea@test.dev', '{"birth_date": "1990-07-15"}');

set local role authenticated;
set local request.jwt.claims to '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select lives_ok(
  $$ insert into public.body_measurements (user_id, measured_on, weight_kg, waist_cm)
     values ('11111111-1111-1111-1111-111111111111', current_date, 82.4, 86) $$,
  'a user can log their weight and waist'
);

-- Saving again the same day updates the row instead of adding another one.
select lives_ok(
  $$ insert into public.body_measurements (user_id, measured_on, weight_kg)
     values ('11111111-1111-1111-1111-111111111111', current_date, 82.1)
     on conflict (user_id, measured_on) do update set weight_kg = excluded.weight_kg $$,
  'saving twice on the same day updates the day'
);

select is(
  (select weight_kg from public.body_measurements where measured_on = current_date),
  82.10::numeric(5, 2),
  'the day keeps the last value'
);

select throws_ok(
  $$ insert into public.body_measurements (user_id, measured_on)
     values ('11111111-1111-1111-1111-111111111111', current_date - 1) $$,
  '23514',
  null,
  'an empty measurement is rejected'
);

select throws_ok(
  $$ insert into public.body_measurements (user_id, measured_on, weight_kg)
     values ('11111111-1111-1111-1111-111111111111', current_date - 2, 5) $$,
  '23514',
  null,
  'an impossible weight is rejected'
);

-- Bea can neither read Ana's measurements nor write them in Ana's name -------------------------

set local request.jwt.claims to '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';

select is(
  (select count(*)::int from public.body_measurements),
  0,
  'another user cannot read the measurements'
);

select throws_ok(
  $$ insert into public.body_measurements (user_id, measured_on, weight_kg)
     values ('11111111-1111-1111-1111-111111111111', current_date - 3, 80) $$,
  '42501',
  null,
  'another user cannot log measurements for someone else'
);

select * from finish();
rollback;

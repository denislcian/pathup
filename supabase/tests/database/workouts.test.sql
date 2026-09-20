begin;
create extension if not exists pgtap with schema extensions;

select plan(7);

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'ana@test.dev', '{"birth_date": "1995-03-01"}'),
  ('22222222-2222-2222-2222-222222222222', 'bea@test.dev', '{"birth_date": "1990-07-15"}');

-- Ana logs a workout ---------------------------------------------------------------------------

set local role authenticated;
set local request.jwt.claims to '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select lives_ok(
  $$ insert into public.workouts (id, user_id, name, started_at, ended_at)
     values ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
             'Torso', now() - interval '1 hour', now());
     insert into public.workout_exercises (id, workout_id, user_id, exercise_slug, position)
     values ('bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001',
             '11111111-1111-1111-1111-111111111111', 'press-banca-barra', 0);
     insert into public.workout_sets (id, workout_exercise_id, user_id, position, weight_kg, reps, rir, completed_at)
     values ('cccccccc-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001',
             '11111111-1111-1111-1111-111111111111', 0, 82.5, 8, 2, now()) $$,
  'a user can log a workout with exercises and sets'
);

-- Re-uploading the same workout must not duplicate it (offline queue retries) ------------------

select lives_ok(
  $$ insert into public.workouts (id, user_id, name, started_at, ended_at)
     values ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
             'Torso', now() - interval '1 hour', now())
     on conflict (id) do update set name = excluded.name $$,
  'uploading the same workout twice updates it instead of duplicating'
);

select is(
  (select count(*)::int from public.workouts),
  1,
  'the retry left a single workout'
);

-- Invalid data is rejected by the database ------------------------------------------------------

select throws_ok(
  $$ insert into public.workout_sets (id, workout_exercise_id, user_id, position, weight_kg, reps, completed_at)
     values ('cccccccc-0000-0000-0000-000000000009', 'bbbbbbbb-0000-0000-0000-000000000001',
             '11111111-1111-1111-1111-111111111111', 1, 82.5, 0, now()) $$,
  '23514',
  null,
  'a set with zero repetitions is rejected'
);

-- Bea cannot see or touch Ana's workout ---------------------------------------------------------

set local request.jwt.claims to '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';

select is(
  (select count(*)::int from public.workouts),
  0,
  'another user cannot read the workout'
);

select throws_ok(
  $$ insert into public.workout_sets (id, workout_exercise_id, user_id, position, weight_kg, reps, completed_at)
     values ('cccccccc-0000-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000001',
             '22222222-2222-2222-2222-222222222222', 5, 60, 10, now()) $$,
  '23503',
  null,
  'another user cannot add sets to a workout that is not theirs'
);

delete from public.workouts;

reset role;

select is(
  (select count(*)::int from public.workouts where id = 'aaaaaaaa-0000-0000-0000-000000000001'),
  1,
  'another user cannot delete the workout'
);

select * from finish();
rollback;

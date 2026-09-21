begin;
create extension if not exists pgtap with schema extensions;

select plan(7);

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'ana@test.dev', '{"birth_date": "1995-03-01"}'),
  ('22222222-2222-2222-2222-222222222222', 'bea@test.dev', '{"birth_date": "1990-07-15"}');

-- Ana creates a routine ------------------------------------------------------------------------

set local role authenticated;
set local request.jwt.claims to '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select lives_ok(
  $$ insert into public.routines (id, user_id, name, folder, position)
     values ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
             'Torso A', 'Torso / Pierna', 0);
     insert into public.routine_exercises (id, routine_id, user_id, exercise_slug, position, target_sets, rep_min, rep_max)
     values ('bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001',
             '11111111-1111-1111-1111-111111111111', 'press-banca-barra', 0, 3, 6, 10),
            ('bbbbbbbb-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001',
             '11111111-1111-1111-1111-111111111111', 'remo-barra', 1, 3, 8, 12) $$,
  'a user can create a routine with exercises'
);

-- Reordering swaps positions in one statement; the unique check waits until the end.
select lives_ok(
  $$ update public.routine_exercises
     set position = case position when 0 then 1 else 0 end
     where routine_id = 'aaaaaaaa-0000-0000-0000-000000000001' $$,
  'exercises can swap positions'
);

select throws_ok(
  $$ insert into public.routine_exercises (id, routine_id, user_id, exercise_slug, position, rep_min, rep_max)
     values ('bbbbbbbb-0000-0000-0000-000000000009', 'aaaaaaaa-0000-0000-0000-000000000001',
             '11111111-1111-1111-1111-111111111111', 'flexiones', 2, 12, 8) $$,
  '23514',
  null,
  'a rep range that goes backwards is rejected'
);

-- Bea cannot see or touch Ana's routine ---------------------------------------------------------

set local request.jwt.claims to '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';

select is(
  (select count(*)::int from public.routines),
  0,
  'another user cannot read the routine'
);

select throws_ok(
  $$ insert into public.routine_exercises (id, routine_id, user_id, exercise_slug, position)
     values ('bbbbbbbb-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001',
             '22222222-2222-2222-2222-222222222222', 'flexiones', 5) $$,
  '23503',
  null,
  'another user cannot add exercises to a routine that is not theirs'
);

delete from public.routines;

reset role;

select is(
  (select count(*)::int from public.routines where id = 'aaaaaaaa-0000-0000-0000-000000000001'),
  1,
  'another user cannot delete the routine'
);

-- Deleting the routine takes its exercises with it ---------------------------------------------

delete from public.routines where id = 'aaaaaaaa-0000-0000-0000-000000000001';

select is(
  (select count(*)::int from public.routine_exercises),
  0,
  'deleting a routine deletes its exercises'
);

select * from finish();
rollback;

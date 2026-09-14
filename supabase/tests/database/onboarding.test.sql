begin;
create extension if not exists pgtap with schema extensions;

select plan(6);

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'adult@test.dev', '{"birth_date": "1992-04-10"}'),
  ('22222222-2222-2222-2222-222222222222', 'teen@test.dev',
   jsonb_build_object('birth_date', (current_date - interval '17 years')::date));

-- The adult completes onboarding -----------------------------------------------------------

set local role authenticated;
set local request.jwt.claims to '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select lives_ok(
  $$ update public.profiles
     set goal = 'fat_loss', experience_level = 'beginner', training_days_per_week = 3,
         equipment = array['gym', 'dumbbells'], parq_flagged = false, parq_completed_at = now(),
         onboarding_completed_at = now() $$,
  'an adult can save every onboarding answer, including a fat-loss goal'
);

select throws_ok(
  $$ update public.profiles set equipment = array['kettlebell-rack'] $$,
  '23514',
  null,
  'unknown equipment values are rejected'
);

select throws_ok(
  $$ update public.profiles set training_days_per_week = 8 $$,
  '23514',
  null,
  'training days must be between 1 and 7'
);

reset role;

select results_eq(
  $$ select goal, training_days_per_week, equipment, onboarding_completed_at is not null
     from public.profiles where id = '11111111-1111-1111-1111-111111111111' $$,
  $$ values ('fat_loss'::text, 3::smallint, array['gym', 'dumbbells']::text[], true) $$,
  'onboarding answers are stored'
);

-- The 17 year old ----------------------------------------------------------------------------

set local role authenticated;
set local request.jwt.claims to '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';

select throws_ok(
  $$ update public.profiles set goal = 'fat_loss' $$,
  '23514',
  'Fat-loss goals are not available for users under 18',
  'users under 18 cannot choose a fat-loss goal'
);

select lives_ok(
  $$ update public.profiles set goal = 'health', training_days_per_week = 2 $$,
  'users under 18 can choose other goals'
);

reset role;

select * from finish();
rollback;

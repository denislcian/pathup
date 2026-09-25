begin;
create extension if not exists pgtap with schema extensions;

select plan(6);

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'ana@test.dev', '{"birth_date": "1995-03-01"}'),
  ('22222222-2222-2222-2222-222222222222', 'bea@test.dev', '{"birth_date": "1990-07-15"}');

set local role authenticated;
set local request.jwt.claims to '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select lives_ok(
  $$ insert into public.habits (id, user_id, name, target, unit)
     values ('eeeeeeee-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
             'Beber agua', 8, 'vasos');
     insert into public.habit_logs (habit_id, user_id, day, count)
     values ('eeeeeeee-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
             current_date, 3) $$,
  'a user can create a habit and log it'
);

select lives_ok(
  $$ insert into public.habit_logs (habit_id, user_id, day, count)
     values ('eeeeeeee-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
             current_date, 4)
     on conflict (habit_id, day) do update set count = excluded.count $$,
  'logging the same day again updates the count'
);

select is(
  (select count from public.habit_logs where day = current_date),
  4::smallint,
  'the day keeps the last count'
);

select throws_ok(
  $$ insert into public.habits (id, user_id, name, target)
     values ('eeeeeeee-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
             'Imposible', 0) $$,
  '23514',
  null,
  'a habit needs a target of at least 1'
);

set local request.jwt.claims to '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';

select is(
  (select count(*)::int from public.habits),
  0,
  'another user cannot read the habits'
);

select throws_ok(
  $$ insert into public.habit_logs (habit_id, user_id, day, count)
     values ('eeeeeeee-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222',
             current_date - 1, 1) $$,
  '23503',
  null,
  'another user cannot log someone else''s habit'
);

select * from finish();
rollback;

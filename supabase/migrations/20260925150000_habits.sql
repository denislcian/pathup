-- PathUp · habits
-- Daily habits with a target per day: 1 for a tick ("estirar"), more for a counter ("8 vasos de
-- agua"). One log row per habit and day, holding how many times it happened. Ids of habits come
-- from the phone, like the rest of the app, so saving is an idempotent upsert.

create table public.habits (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  target smallint not null default 1,
  unit text,
  position smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint habits_name_length check (char_length(name) between 1 and 40),
  constraint habits_unit_length check (unit is null or char_length(unit) between 1 and 12),
  constraint habits_target_range check (target between 1 and 30),
  constraint habits_position_range check (position between 0 and 99),
  -- Lets logs point at (id, user_id) so they can never hang off another user's habit.
  unique (id, user_id)
);

create index habits_user_position_idx on public.habits (user_id, position);

create table public.habit_logs (
  habit_id uuid not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  count smallint not null,
  updated_at timestamptz not null default now(),

  primary key (habit_id, day),
  constraint habit_logs_count_range check (count between 0 and 99),
  foreign key (habit_id, user_id) references public.habits (id, user_id) on delete cascade
);

create index habit_logs_user_day_idx on public.habit_logs (user_id, day desc);

comment on table public.habits is 'Daily habits. target = times a day for it to count as done.';
comment on table public.habit_logs is 'How many times a habit happened on a day. One row per habit and day.';

create trigger habits_set_updated_at
  before update on public.habits
  for each row execute function public.set_updated_at();

create trigger habit_logs_set_updated_at
  before update on public.habit_logs
  for each row execute function public.set_updated_at();

-- Row level security ------------------------------------------------------------------------

alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;

revoke all on table public.habits from anon;
revoke all on table public.habit_logs from anon;

do $$
declare
  target text;
begin
  foreach target in array array['habits', 'habit_logs'] loop
    execute format(
      $f$ create policy "Users read their own %1$s"
            on public.%1$I for select to authenticated
            using ((select auth.uid()) = user_id) $f$, target);
    execute format(
      $f$ create policy "Users insert their own %1$s"
            on public.%1$I for insert to authenticated
            with check ((select auth.uid()) = user_id) $f$, target);
    execute format(
      $f$ create policy "Users update their own %1$s"
            on public.%1$I for update to authenticated
            using ((select auth.uid()) = user_id)
            with check ((select auth.uid()) = user_id) $f$, target);
    execute format(
      $f$ create policy "Users delete their own %1$s"
            on public.%1$I for delete to authenticated
            using ((select auth.uid()) = user_id) $f$, target);
  end loop;
end;
$$;

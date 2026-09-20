-- PathUp · workouts
-- A workout is created on the phone (client-generated UUIDs) and uploaded when there is network,
-- so every table is upsert friendly and owned by a single user.

create table public.workouts (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint workouts_name_length check (char_length(name) between 1 and 80),
  constraint workouts_notes_length check (char_length(notes) <= 1000),
  constraint workouts_ends_after_start check (ended_at is null or ended_at >= started_at),
  -- Lets children point at (id, user_id) so a row can never hang off another user's workout.
  unique (id, user_id)
);

create index workouts_user_started_idx on public.workouts (user_id, started_at desc);

create table public.workout_exercises (
  id uuid primary key,
  workout_id uuid not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  exercise_slug text not null,
  position smallint not null,
  superset_group smallint,
  notes text,

  constraint workout_exercises_slug_format check (exercise_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint workout_exercises_position_range check (position between 0 and 100),
  constraint workout_exercises_notes_length check (char_length(notes) <= 500),
  unique (workout_id, position),
  unique (id, user_id),
  foreign key (workout_id, user_id) references public.workouts (id, user_id) on delete cascade
);

create index workout_exercises_workout_idx on public.workout_exercises (workout_id);

create table public.workout_sets (
  id uuid primary key,
  workout_exercise_id uuid not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  position smallint not null,
  set_type text not null default 'normal',
  weight_kg numeric(6, 2) not null,
  reps smallint not null,
  rir smallint,
  completed_at timestamptz not null,

  constraint workout_sets_type_values check (set_type in ('warmup', 'normal', 'drop', 'failure')),
  constraint workout_sets_weight_range check (weight_kg between 0 and 999),
  constraint workout_sets_reps_range check (reps between 1 and 999),
  constraint workout_sets_rir_range check (rir is null or rir between 0 and 10),
  constraint workout_sets_position_range check (position between 0 and 100),
  unique (workout_exercise_id, position),
  foreign key (workout_exercise_id, user_id)
    references public.workout_exercises (id, user_id) on delete cascade
);

create index workout_sets_exercise_idx on public.workout_sets (workout_exercise_id);

comment on table public.workouts is 'One training session. Ids are generated on the device so uploads are idempotent.';
comment on column public.workout_exercises.exercise_slug is 'Slug from the bundled catalogue (src/data/exercises.ts).';

create trigger workouts_set_updated_at
  before update on public.workouts
  for each row execute function public.set_updated_at();

-- Row level security ------------------------------------------------------------------------

alter table public.workouts enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.workout_sets enable row level security;

revoke all on table public.workouts from anon;
revoke all on table public.workout_exercises from anon;
revoke all on table public.workout_sets from anon;

do $$
declare
  target text;
begin
  foreach target in array array['workouts', 'workout_exercises', 'workout_sets'] loop
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

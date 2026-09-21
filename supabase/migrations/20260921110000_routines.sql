-- PathUp · routines
-- A routine is a reusable plan: which exercises, how many sets and which rep range. Weights are
-- not stored here: they come from the last time you did each exercise, so the plan never goes
-- stale. Ids are generated on the phone, like workouts, so saving is an idempotent upsert.

create table public.routines (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  folder text,
  position smallint not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint routines_name_length check (char_length(name) between 1 and 80),
  constraint routines_folder_length check (folder is null or char_length(folder) between 1 and 40),
  constraint routines_position_range check (position between 0 and 999),
  constraint routines_notes_length check (char_length(notes) <= 1000),
  -- Lets exercises point at (id, user_id) so they can never hang off another user's routine.
  unique (id, user_id)
);

create index routines_user_position_idx on public.routines (user_id, position);

create table public.routine_exercises (
  id uuid primary key,
  routine_id uuid not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  exercise_slug text not null,
  position smallint not null,
  target_sets smallint not null default 3,
  rep_min smallint not null default 8,
  rep_max smallint not null default 12,
  notes text,

  constraint routine_exercises_slug_format check (exercise_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint routine_exercises_position_range check (position between 0 and 100),
  constraint routine_exercises_sets_range check (target_sets between 1 and 10),
  constraint routine_exercises_reps_range check (rep_min between 1 and 100 and rep_max between rep_min and 100),
  constraint routine_exercises_notes_length check (char_length(notes) <= 500),
  unique (routine_id, position) deferrable initially deferred,
  foreign key (routine_id, user_id) references public.routines (id, user_id) on delete cascade
);

create index routine_exercises_routine_idx on public.routine_exercises (routine_id);

comment on table public.routines is 'Reusable training plan. Ids are generated on the device so saving is idempotent.';
comment on column public.routines.folder is 'Optional folder name used to group routines, e.g. "Torso / Pierna".';
comment on column public.routine_exercises.exercise_slug is 'Slug from the bundled catalogue (src/data/exercises.ts).';

create trigger routines_set_updated_at
  before update on public.routines
  for each row execute function public.set_updated_at();

-- Row level security ------------------------------------------------------------------------

alter table public.routines enable row level security;
alter table public.routine_exercises enable row level security;

revoke all on table public.routines from anon;
revoke all on table public.routine_exercises from anon;

do $$
declare
  target text;
begin
  foreach target in array array['routines', 'routine_exercises'] loop
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

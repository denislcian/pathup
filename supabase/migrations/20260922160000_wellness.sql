-- PathUp · wellness check-in
-- One check-in per user and day, with the answers of the 20-second questionnaire. The readiness
-- score is computed in the app (src/domain/wellness.ts) and stored so the history keeps the value
-- the user actually saw. Health data: covered by the consent given at sign-up.

create table public.wellness_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  sleep_hours numeric(3, 1) not null,
  sleep_quality smallint not null,
  energy smallint not null,
  stress smallint not null,
  soreness smallint not null,
  mood smallint not null,
  readiness smallint not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint wellness_checkins_one_per_day unique (user_id, day),
  constraint wellness_checkins_sleep_hours_range check (sleep_hours between 0 and 24),
  constraint wellness_checkins_scales_range check (
    sleep_quality between 1 and 5
    and energy between 1 and 5
    and stress between 1 and 5
    and soreness between 1 and 5
    and mood between 1 and 5
  ),
  constraint wellness_checkins_readiness_range check (readiness between 0 and 100),
  constraint wellness_checkins_note_length check (char_length(note) <= 500)
);

create index wellness_checkins_user_day_idx on public.wellness_checkins (user_id, day desc);

comment on table public.wellness_checkins is 'Daily 20-second check-in. One row per user and day.';

create trigger wellness_checkins_set_updated_at
  before update on public.wellness_checkins
  for each row execute function public.set_updated_at();

-- Row level security ------------------------------------------------------------------------

alter table public.wellness_checkins enable row level security;
revoke all on table public.wellness_checkins from anon;

create policy "Users read their own check-ins"
  on public.wellness_checkins for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users insert their own check-ins"
  on public.wellness_checkins for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users update their own check-ins"
  on public.wellness_checkins for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users delete their own check-ins"
  on public.wellness_checkins for delete to authenticated
  using ((select auth.uid()) = user_id);

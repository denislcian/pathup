-- PathUp · body measurements
-- One row per user and day: saving again on the same day updates it. Every value is optional,
-- but a row has to carry at least one. Health data: covered by the explicit consent given at
-- sign-up (profiles.health_data_consent_at).

create table public.body_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  measured_on date not null,
  weight_kg numeric(5, 2),
  body_fat_pct numeric(4, 1),
  waist_cm numeric(5, 1),
  hips_cm numeric(5, 1),
  chest_cm numeric(5, 1),
  arm_cm numeric(5, 1),
  thigh_cm numeric(5, 1),
  neck_cm numeric(5, 1),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint body_measurements_one_per_day unique (user_id, measured_on),
  constraint body_measurements_weight_range check (weight_kg between 20 and 400),
  constraint body_measurements_fat_range check (body_fat_pct between 2 and 70),
  constraint body_measurements_girth_range check (
    (waist_cm is null or waist_cm between 30 and 300)
    and (hips_cm is null or hips_cm between 30 and 300)
    and (chest_cm is null or chest_cm between 30 and 300)
    and (arm_cm is null or arm_cm between 10 and 100)
    and (thigh_cm is null or thigh_cm between 20 and 150)
    and (neck_cm is null or neck_cm between 20 and 80)
  ),
  constraint body_measurements_notes_length check (char_length(notes) <= 500),
  constraint body_measurements_has_a_value check (
    num_nonnulls(weight_kg, body_fat_pct, waist_cm, hips_cm, chest_cm, arm_cm, thigh_cm, neck_cm) > 0
  )
);

comment on table public.body_measurements is 'Body weight, body fat and girths. One row per user and day.';

create trigger body_measurements_set_updated_at
  before update on public.body_measurements
  for each row execute function public.set_updated_at();

-- Row level security ------------------------------------------------------------------------

alter table public.body_measurements enable row level security;
revoke all on table public.body_measurements from anon;

create policy "Users read their own measurements"
  on public.body_measurements for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users insert their own measurements"
  on public.body_measurements for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users update their own measurements"
  on public.body_measurements for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users delete their own measurements"
  on public.body_measurements for delete to authenticated
  using ((select auth.uid()) = user_id);

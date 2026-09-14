-- PathUp · profiles
-- One row per auth user: onboarding answers and privacy settings.
-- Health data (check-ins, measurements, photos) lives in its own tables in later phases.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  display_name text,
  birth_date date,
  sex text,
  height_cm numeric(4, 1),
  units text not null default 'metric',
  experience_level text,
  goal text,
  beginner_mode boolean not null default true,
  is_private boolean not null default true,
  health_data_consent_at timestamptz,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_username_format check (username ~ '^[a-z0-9_]{3,24}$'),
  constraint profiles_display_name_length check (char_length(display_name) between 1 and 50),
  constraint profiles_birth_date_range check (birth_date >= date '1900-01-01'),
  constraint profiles_sex_values check (sex in ('female', 'male', 'other')),
  constraint profiles_height_range check (height_cm between 100 and 250),
  constraint profiles_units_values check (units in ('metric', 'imperial')),
  constraint profiles_experience_values check (experience_level in ('beginner', 'intermediate', 'advanced')),
  constraint profiles_goal_values check (goal in ('muscle', 'strength', 'fat_loss', 'health', 'endurance'))
);

comment on table public.profiles is 'One row per user. Sex and height are optional (data minimisation, GDPR).';
comment on column public.profiles.health_data_consent_at is 'Explicit consent to process health data (GDPR art. 9). Null = not given.';

-- updated_at ---------------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Age rules: minimum age 16, and users under 18 always keep a private profile --------

create function public.enforce_profile_age_rules()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.birth_date is null then
    return new;
  end if;

  if new.birth_date > (current_date - interval '16 years') then
    raise exception 'PathUp requires users to be at least 16 years old'
      using errcode = 'check_violation';
  end if;

  if new.birth_date > (current_date - interval '18 years') then
    new.is_private := true;
  end if;

  return new;
end;
$$;

create trigger profiles_enforce_age_rules
  before insert or update of birth_date, is_private on public.profiles
  for each row execute function public.enforce_profile_age_rules();

-- Create the profile when a user signs up, from the sign-up metadata ------------------

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.profiles (id, display_name, birth_date, health_data_consent_at)
  values (
    new.id,
    nullif(trim(meta ->> 'display_name'), ''),
    nullif(meta ->> 'birth_date', '')::date,
    case when (meta ->> 'health_data_consent')::boolean then now() end
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row level security ------------------------------------------------------------------

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon;

-- Only these columns can be changed by the user; id and timestamps are managed by the database.
revoke update on table public.profiles from authenticated;
grant update (
  username, display_name, birth_date, sex, height_cm, units, experience_level, goal,
  beginner_mode, is_private, health_data_consent_at, onboarding_completed_at
) on table public.profiles to authenticated;

create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "Users can create their own profile"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

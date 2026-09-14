-- PathUp · onboarding answers
-- Training days, available equipment and the PAR-Q+ based health screening result.
-- Also blocks fat-loss goals for users under 18 (no caloric deficits for minors).

alter table public.profiles
  add column training_days_per_week smallint,
  add column equipment text[] not null default '{}',
  add column parq_flagged boolean,
  add column parq_completed_at timestamptz,
  add constraint profiles_training_days_range check (training_days_per_week between 1 and 7),
  add constraint profiles_equipment_values
    check (equipment <@ array['gym', 'dumbbells', 'bands', 'bodyweight']::text[]);

comment on column public.profiles.equipment is 'What the user can train with: gym, dumbbells, bands, bodyweight.';
comment on column public.profiles.parq_flagged is 'True when any health screening answer suggests asking a doctor first. Never blocks usage.';

grant update (training_days_per_week, equipment, parq_flagged, parq_completed_at)
  on table public.profiles to authenticated;

-- Age rules now also cover the goal -----------------------------------------------------

create or replace function public.enforce_profile_age_rules()
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

    if new.goal = 'fat_loss' then
      raise exception 'Fat-loss goals are not available for users under 18'
        using errcode = 'check_violation';
    end if;
  end if;

  return new;
end;
$$;

drop trigger profiles_enforce_age_rules on public.profiles;

create trigger profiles_enforce_age_rules
  before insert or update of birth_date, is_private, goal on public.profiles
  for each row execute function public.enforce_profile_age_rules();

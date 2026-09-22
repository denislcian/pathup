-- PathUp · guided programmes
-- Which programme you are following, and which session of it each workout was. Progress is not
-- stored: it is counted from the workouts themselves (which already reach the server through the
-- offline queue), so missing a day never loses the week.

alter table public.workouts
  add column program_slug text,
  add column program_session text,
  add constraint workouts_program_slug_format
    check (program_slug is null or program_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  add constraint workouts_program_session_format
    check (program_session is null or program_session ~ '^w[0-9]{1,2}-[a-z]$'),
  add constraint workouts_program_session_needs_programme
    check (program_session is null or program_slug is not null);

create index workouts_program_idx
  on public.workouts (user_id, program_slug)
  where program_slug is not null;

comment on column public.workouts.program_session is 'Session of the programme, e.g. w3-b (week 3, session B).';

create table public.program_enrollments (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  program_slug text not null,
  started_on date not null default current_date,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint program_enrollments_slug_format check (program_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint program_enrollments_status_values
    check (status in ('active', 'finished', 'abandoned'))
);

-- Only one programme at a time; finished or abandoned ones stay as history.
create unique index program_enrollments_one_active
  on public.program_enrollments (user_id)
  where status = 'active';

create index program_enrollments_user_idx on public.program_enrollments (user_id, started_on desc);

comment on table public.program_enrollments is 'The programme a user is following. Ids come from the device, like workouts.';

create trigger program_enrollments_set_updated_at
  before update on public.program_enrollments
  for each row execute function public.set_updated_at();

-- Row level security ------------------------------------------------------------------------

alter table public.program_enrollments enable row level security;
revoke all on table public.program_enrollments from anon;

create policy "Users read their own enrollments"
  on public.program_enrollments for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users insert their own enrollments"
  on public.program_enrollments for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users update their own enrollments"
  on public.program_enrollments for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users delete their own enrollments"
  on public.program_enrollments for delete to authenticated
  using ((select auth.uid()) = user_id);

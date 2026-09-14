import type { Profile } from '@/features/profile/profile-api';

/** Loading the whole route tree is slow on a busy runner (parallel suites, CI). */
export const ROUTER_TIMEOUT = { timeout: 10_000 };

export const fakeSession = { user: { id: 'user-1', email: 'ana@test.dev' } };

export function buildProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'user-1',
    username: null,
    display_name: 'Ana',
    birth_date: '1995-03-01',
    sex: null,
    height_cm: null,
    units: 'metric',
    experience_level: 'beginner',
    goal: 'muscle',
    beginner_mode: true,
    is_private: true,
    health_data_consent_at: '2026-09-14T10:00:00Z',
    onboarding_completed_at: '2026-09-14T10:05:00Z',
    training_days_per_week: 3,
    equipment: ['gym'],
    parq_flagged: false,
    parq_completed_at: '2026-09-14T10:05:00Z',
    created_at: '2026-09-14T10:00:00Z',
    updated_at: '2026-09-14T10:05:00Z',
    ...overrides,
  };
}

/** DD/MM/YYYY for the date `years` years before today. */
export function birthDateYearsAgo(years: number): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

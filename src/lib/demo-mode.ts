import { Platform } from 'react-native';

/**
 * Development-only preview of the signed-in app: open the web app with `?demo=1` to browse the
 * screens with canned data, without an account. It is compiled out of production builds.
 */
export function isDemoMode(): boolean {
  if (!__DEV__ || Platform.OS !== 'web' || typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).has('demo');
}

export const DEMO_SESSION = {
  user: { id: 'demo-user', email: 'demo@pathup.app' },
} as const;

/** Canned profile used by the development preview. */
export const DEMO_PROFILE = {
  id: 'demo-user',
  username: 'denis',
  display_name: 'Denis',
  birth_date: '1997-05-12',
  sex: null,
  height_cm: 185,
  units: 'metric',
  experience_level: 'intermediate',
  goal: 'muscle',
  beginner_mode: false,
  is_private: true,
  health_data_consent_at: '2026-09-20T10:00:00Z',
  onboarding_completed_at: '2026-09-20T10:05:00Z',
  training_days_per_week: 5,
  equipment: ['gym'],
  parq_flagged: false,
  parq_completed_at: '2026-09-20T10:05:00Z',
  created_at: '2026-09-20T10:00:00Z',
  updated_at: '2026-09-20T10:05:00Z',
};

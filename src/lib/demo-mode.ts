import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';

/**
 * "Probar sin cuenta": the whole app with eight weeks of sample data kept in memory
 * (src/lib/demo-backend.ts). Nothing reaches the database. It is switched on from the landing, and
 * in development also with `?demo=1` in the URL. On the web the choice survives a reload.
 */

const STORAGE_KEY = 'pathup.demo';
const listeners = new Set<() => void>();
let demoFlag: boolean | undefined;

function readInitialFlag(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  try {
    if (__DEV__ && new URLSearchParams(window.location.search).has('demo')) return true;
    return window.localStorage?.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function isDemoMode(): boolean {
  // Read once: the query string is gone as soon as you navigate inside the app.
  demoFlag ??= readInitialFlag();
  return demoFlag;
}

export function setDemoMode(enabled: boolean): void {
  demoFlag = enabled;
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      if (enabled) window.localStorage?.setItem(STORAGE_KEY, '1');
      else window.localStorage?.removeItem(STORAGE_KEY);
    } catch {
      // Private browsing: the demo simply ends with the tab.
    }
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Re-renders when the demo is switched on or off. Never on while rendering the static HTML. */
export function useDemoMode(): boolean {
  return useSyncExternalStore(subscribe, isDemoMode, () => false);
}

export const DEMO_SESSION = {
  user: { id: 'demo-user', email: 'demo@pathup.app' },
} as const;

/** The person in the demo: Marcos, 32, who has trained for a few years (a persona from docs/01). */
export const DEMO_PROFILE = {
  id: 'demo-user',
  username: 'marcos',
  display_name: 'Marcos',
  birth_date: '1994-05-12',
  sex: null,
  height_cm: 182,
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

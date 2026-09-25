import { fetchProfile } from '@/features/profile/profile-api';
import { fetchRemoteWorkouts } from '@/features/history/history-api';
import { fetchMeasurements } from '@/features/measurements/measurements-api';
import { fetchActiveEnrollment } from '@/features/programs/programs-api';
import { fetchRoutines } from '@/features/routines/routines-api';
import { fetchCheckins } from '@/features/wellness/wellness-api';
import { readOutbox } from '@/features/workout/workout-storage';
import { DEMO_PROFILE, isDemoMode } from '@/lib/demo-mode';
import { requireSupabase } from '@/lib/supabase';

export const EXPORT_VERSION = 1;

/**
 * Everything PathUp stores about you, in one JSON document (GDPR right of access and
 * portability). Workouts still waiting on the phone are included too, marked as such.
 */
export async function exportMyData(userId: string): Promise<string> {
  const [profile, workouts, routines, measurements, checkins, program, pending] = await Promise.all(
    [
      isDemoMode() ? Promise.resolve(DEMO_PROFILE) : fetchProfile(userId),
      fetchRemoteWorkouts(),
      fetchRoutines(),
      fetchMeasurements(),
      fetchCheckins(),
      fetchActiveEnrollment(),
      readOutbox(),
    ],
  );

  return JSON.stringify(
    {
      app: 'PathUp',
      version: EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      profile,
      program,
      workouts,
      workoutsNotUploadedYet: pending,
      routines,
      bodyMeasurements: measurements,
      wellnessCheckins: checkins,
    },
    null,
    2,
  );
}

export function exportFileName(date = new Date()): string {
  return `pathup-mis-datos-${date.toISOString().slice(0, 10)}.json`;
}

/** Deletes the account and, by cascade, every row that belongs to it. Needs a connection. */
export async function deleteMyAccount(): Promise<void> {
  if (isDemoMode()) return;
  const { error } = await requireSupabase().rpc('delete_my_account');
  if (error) throw error;
}

import type { QueryClient } from '@tanstack/react-query';

import { clearLocalHabits } from '@/features/habits/habits-api';
import { clearLocalMeasurements } from '@/features/measurements/measurements-api';
import { clearLocalProgram } from '@/features/programs/programs-api';
import { clearLocalRoutines } from '@/features/routines/routines-api';
import { clearLocalWellness } from '@/features/wellness/wellness-api';
import { useActiveWorkout } from '@/features/workout/active-workout-store';
import { useFinishedWorkout } from '@/features/workout/finished-workout-store';
import { clearLocalWorkouts } from '@/features/workout/workout-storage';
import { supabase } from '@/lib/supabase';

/**
 * Removes everything this account left on the device: the offline queue, every cached copy and
 * the workout in progress. Used when signing out and after deleting the account, so the next
 * person who signs in on the same phone never sees (or uploads) someone else's data.
 */
export async function forgetThisDevice(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    clearLocalWorkouts(),
    clearLocalRoutines(),
    clearLocalMeasurements(),
    clearLocalProgram(),
    clearLocalWellness(),
    clearLocalHabits(),
  ]);
  useActiveWorkout.getState().discard();
  useFinishedWorkout.getState().clear();
  queryClient.clear();
}

export async function signOutAndForget(queryClient: QueryClient): Promise<void> {
  await supabase?.auth.signOut();
  await forgetThisDevice(queryClient);
}

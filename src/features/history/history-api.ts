import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { SET_TYPES, toPreviousPerformance, type SetType, type Workout } from '@/domain/workout';
import { useAuth } from '@/features/auth/auth-provider';
import {
  mergeWorkouts,
  readHistorySnapshot,
  readOutbox,
  removeFromOutbox,
  savePreviousPerformance,
  writeHistorySnapshot,
} from '@/features/workout/workout-storage';
import { demoBackend } from '@/lib/demo-backend';
import { isDemoMode } from '@/lib/demo-mode';
import { isSupabaseConfigured, requireSupabase } from '@/lib/supabase';

/** Enough for years of training at 4 sessions a week; paging arrives if anyone gets close. */
export const HISTORY_LIMIT = 500;

export const historyKeys = {
  all: (userId: string | undefined) => ['workouts', userId] as const,
};

const WORKOUT_SELECT = `
  id, name, started_at, ended_at, program_slug, program_session,
  workout_exercises (
    id, exercise_slug, position,
    workout_sets ( id, position, set_type, weight_kg, reps, rir, completed_at )
  )
`;

type WorkoutRow = {
  id: string;
  name: string;
  started_at: string;
  ended_at: string | null;
  program_slug: string | null;
  program_session: string | null;
  workout_exercises: {
    id: string;
    exercise_slug: string;
    position: number;
    workout_sets: {
      id: string;
      position: number;
      set_type: string;
      weight_kg: number;
      reps: number;
      rir: number | null;
      completed_at: string;
    }[];
  }[];
};

function toSetType(value: string): SetType {
  return (SET_TYPES as readonly string[]).includes(value) ? (value as SetType) : 'normal';
}

export function toWorkout(row: WorkoutRow): Workout {
  return {
    id: row.id,
    name: row.name,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    programSlug: row.program_slug,
    programSession: row.program_session,
    exercises: [...row.workout_exercises]
      .sort((a, b) => a.position - b.position)
      .map((exercise) => ({
        id: exercise.id,
        slug: exercise.exercise_slug,
        sets: [...exercise.workout_sets]
          .sort((a, b) => a.position - b.position)
          .map((set) => ({
            id: set.id,
            type: toSetType(set.set_type),
            weightKg: Number(set.weight_kg),
            reps: set.reps,
            rir: set.rir,
            completedAt: set.completed_at,
          })),
      })),
  };
}

export async function fetchRemoteWorkouts(): Promise<Workout[]> {
  if (isDemoMode()) return demoBackend.listWorkouts();

  const { data, error } = await requireSupabase()
    .from('workouts')
    .select(WORKOUT_SELECT)
    .order('started_at', { ascending: false })
    .limit(HISTORY_LIMIT);
  if (error) throw error;
  return (data as unknown as WorkoutRow[]).map(toWorkout);
}

export type WorkoutHistory = {
  /** Newest first, including workouts that are still waiting to upload. */
  workouts: Workout[];
  /** True when the server could not be reached and the list comes from the phone. */
  offline: boolean;
  /** Workouts still waiting in the offline queue. */
  pendingIds: string[];
};

/**
 * Loads the history from the server, keeps a copy on the phone for the gym, and adds the
 * workouts still in the offline queue so a session shows up the moment it is finished.
 */
export async function loadHistory(): Promise<WorkoutHistory> {
  const outbox = await readOutbox();
  let remote: Workout[];
  let offline = false;

  try {
    if (!isSupabaseConfigured && !isDemoMode()) throw new Error('not configured');
    remote = await fetchRemoteWorkouts();
    await writeHistorySnapshot(remote);
  } catch {
    remote = await readHistorySnapshot();
    offline = true;
  }

  const workouts = mergeWorkouts(remote, outbox);
  // A fresh install still shows last time's weights in grey once the history is downloaded.
  const oldestFirst = [...workouts].reverse();
  await savePreviousPerformance(oldestFirst.flatMap(toPreviousPerformance));
  return { workouts, offline, pendingIds: outbox.map((workout) => workout.id) };
}

export function useWorkoutHistory() {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: historyKeys.all(userId),
    queryFn: loadHistory,
    enabled: Boolean(userId),
  });
}

export async function deleteWorkout(workoutId: string): Promise<void> {
  if (isDemoMode()) {
    demoBackend.deleteWorkout(workoutId);
  } else {
    // Exercises and sets go with it (on delete cascade).
    const { error } = await requireSupabase().from('workouts').delete().eq('id', workoutId);
    if (error) throw error;
  }
  await removeFromOutbox(workoutId);
  const snapshot = await readHistorySnapshot();
  await writeHistorySnapshot(snapshot.filter((workout) => workout.id !== workoutId));
}

export function useDeleteWorkout() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWorkout,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: historyKeys.all(session?.user.id) }),
  });
}

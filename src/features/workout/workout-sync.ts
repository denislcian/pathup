import { sanitizeWorkout, type Workout } from '@/domain/workout';
import {
  addToHistorySnapshot,
  readOutbox,
  removeFromOutbox,
} from '@/features/workout/workout-storage';
import { demoBackend } from '@/lib/demo-backend';
import { isDemoMode } from '@/lib/demo-mode';
import { requireSupabase } from '@/lib/supabase';

/**
 * Uploads one workout. Every row carries an id generated on the device, so repeating an upload
 * updates the same rows instead of duplicating the session.
 */
export async function uploadWorkout(userId: string, original: Workout): Promise<void> {
  // Workouts queued by older versions of the app may carry sets the database rejects.
  const workout = sanitizeWorkout(original);
  if (workout.exercises.length === 0) return;
  if (isDemoMode()) {
    demoBackend.saveWorkout(workout);
    return;
  }

  const supabase = requireSupabase();

  const { error: workoutError } = await supabase.from('workouts').upsert({
    id: workout.id,
    user_id: userId,
    name: workout.name,
    started_at: workout.startedAt,
    ended_at: workout.endedAt,
  });
  if (workoutError) throw workoutError;

  const exercises = workout.exercises.map((exercise, index) => ({
    id: exercise.id,
    workout_id: workout.id,
    user_id: userId,
    exercise_slug: exercise.slug,
    position: index,
  }));
  if (exercises.length > 0) {
    const { error } = await supabase.from('workout_exercises').upsert(exercises);
    if (error) throw error;
  }

  const sets = workout.exercises.flatMap((exercise) =>
    exercise.sets.map((item, index) => ({
      id: item.id,
      workout_exercise_id: exercise.id,
      user_id: userId,
      position: index,
      set_type: item.type,
      weight_kg: item.weightKg,
      reps: item.reps,
      rir: item.rir,
      completed_at: item.completedAt ?? workout.endedAt ?? workout.startedAt,
    })),
  );
  if (sets.length > 0) {
    const { error } = await supabase.from('workout_sets').upsert(sets);
    if (error) throw error;
  }

  await addToHistorySnapshot(workout);
}

export type FlushResult = { uploaded: number; pending: number };

/**
 * Sends everything queued, oldest first. Stops at the first failure (usually no connection) and
 * leaves the rest queued for the next attempt.
 */
export async function flushOutbox(userId: string): Promise<FlushResult> {
  const outbox = await readOutbox();
  let uploaded = 0;

  for (const workout of outbox) {
    try {
      await uploadWorkout(userId, workout);
      await removeFromOutbox(workout.id);
      uploaded += 1;
    } catch {
      break;
    }
  }

  return { uploaded, pending: outbox.length - uploaded };
}

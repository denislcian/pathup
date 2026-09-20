import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PreviousPerformance, Workout } from '@/domain/workout';

const OUTBOX_KEY = 'pathup.workouts.outbox.v1';
const PREVIOUS_KEY = 'pathup.workouts.previous.v1';

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Workouts waiting to reach the server (no signal at the gym, or a failed upload). */
export async function readOutbox(): Promise<Workout[]> {
  return readJson<Workout[]>(OUTBOX_KEY, []);
}

export async function writeOutbox(workouts: Workout[]): Promise<void> {
  await AsyncStorage.setItem(OUTBOX_KEY, JSON.stringify(workouts));
}

export async function enqueueWorkout(workout: Workout): Promise<void> {
  const outbox = await readOutbox();
  const withoutDuplicate = outbox.filter((queued) => queued.id !== workout.id);
  await writeOutbox([...withoutDuplicate, workout]);
}

export async function removeFromOutbox(workoutId: string): Promise<void> {
  const outbox = await readOutbox();
  await writeOutbox(outbox.filter((queued) => queued.id !== workoutId));
}

/** Last time you trained each exercise, shown in grey while logging. Works offline. */
export type PreviousByExercise = Record<string, PreviousPerformance>;

export async function readPreviousPerformance(): Promise<PreviousByExercise> {
  return readJson<PreviousByExercise>(PREVIOUS_KEY, {});
}

export async function savePreviousPerformance(entries: PreviousPerformance[]): Promise<void> {
  const current = await readPreviousPerformance();
  for (const entry of entries) {
    current[entry.slug] = entry;
  }
  await AsyncStorage.setItem(PREVIOUS_KEY, JSON.stringify(current));
}

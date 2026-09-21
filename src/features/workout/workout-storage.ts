import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PreviousPerformance, Workout } from '@/domain/workout';

const OUTBOX_KEY = 'pathup.workouts.outbox.v1';
const PREVIOUS_KEY = 'pathup.workouts.previous.v1';
const HISTORY_KEY = 'pathup.workouts.history.v1';

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

/** Keeps the most recent entry per exercise, whatever order the entries arrive in. */
export async function savePreviousPerformance(entries: PreviousPerformance[]): Promise<void> {
  const current = await readPreviousPerformance();
  for (const entry of entries) {
    const stored = current[entry.slug];
    if (!stored || entry.date >= stored.date) current[entry.slug] = entry;
  }
  await AsyncStorage.setItem(PREVIOUS_KEY, JSON.stringify(current));
}

/** Last history downloaded from the server, so progress and records still show without signal. */
export async function readHistorySnapshot(): Promise<Workout[]> {
  return readJson<Workout[]>(HISTORY_KEY, []);
}

export async function writeHistorySnapshot(workouts: Workout[]): Promise<void> {
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(workouts));
}

/** Adds a workout that just reached the server, so it stays visible if the next download fails. */
export async function addToHistorySnapshot(workout: Workout): Promise<void> {
  await writeHistorySnapshot(mergeWorkouts(await readHistorySnapshot(), [workout]));
}

/** Everything this phone knows about: the last download plus what is still waiting to upload. */
export async function readKnownWorkouts(): Promise<Workout[]> {
  const [snapshot, outbox] = await Promise.all([readHistorySnapshot(), readOutbox()]);
  return mergeWorkouts(snapshot, outbox);
}

/** Joins two lists by id; entries from `newer` replace those in `older`. Newest first. */
export function mergeWorkouts(older: readonly Workout[], newer: readonly Workout[]): Workout[] {
  const byId = new Map(older.map((workout) => [workout.id, workout]));
  for (const workout of newer) byId.set(workout.id, workout);
  return [...byId.values()].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

/**
 * Forgets every workout stored on this phone. Used when signing out, so the next account to sign
 * in on the same device never sees (or uploads) someone else's training.
 */
export async function clearLocalWorkouts(): Promise<void> {
  await AsyncStorage.multiRemove([OUTBOX_KEY, PREVIOUS_KEY, HISTORY_KEY]);
}

import { estimateOneRepMax } from '@/domain/one-rep-max';

export const SET_TYPES = ['warmup', 'normal', 'drop', 'failure'] as const;
export type SetType = (typeof SET_TYPES)[number];

export type LoggedSet = {
  id: string;
  type: SetType;
  weightKg: number;
  reps: number;
  rir: number | null;
  /** ISO timestamp once the set is ticked off, null while it is still a plan. */
  completedAt: string | null;
};

export type LoggedExercise = {
  id: string;
  slug: string;
  sets: LoggedSet[];
};

export type Workout = {
  id: string;
  name: string;
  startedAt: string;
  endedAt: string | null;
  exercises: LoggedExercise[];
};

export const DEFAULT_REST_SECONDS = 120;

export function completedSets(workout: Workout): LoggedSet[] {
  return workout.exercises.flatMap((exercise) =>
    exercise.sets.filter((set) => set.completedAt !== null),
  );
}

export function countCompletedSets(workout: Workout): number {
  return completedSets(workout).length;
}

/** Kilos moved in working sets. Warm-ups don't count towards volume. */
export function workoutVolumeKg(workout: Workout): number {
  const volume = completedSets(workout)
    .filter((set) => set.type !== 'warmup')
    .reduce((total, set) => total + set.weightKg * set.reps, 0);
  return Math.round(volume * 10) / 10;
}

export function workoutDurationSeconds(workout: Workout, now: Date = new Date()): number {
  const end = workout.endedAt ? new Date(workout.endedAt) : now;
  const seconds = Math.floor((end.getTime() - new Date(workout.startedAt).getTime()) / 1000);
  return Math.max(seconds, 0);
}

/** mm:ss, or h:mm:ss once the session passes an hour. */
export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(Math.floor(totalSeconds), 0);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  const pad = (value: number) => String(value).padStart(2, '0');
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(rest)}` : `${minutes}:${pad(rest)}`;
}

/** The set with the highest estimated one-rep max; ties go to the heavier weight. */
export function bestSet(sets: readonly LoggedSet[]): LoggedSet | null {
  const working = sets.filter((set) => set.completedAt !== null && set.type !== 'warmup');
  if (working.length === 0) return null;

  return working.reduce((best, set) => {
    const bestScore = estimateOneRepMax(best.weightKg, best.reps) ?? best.weightKg;
    const score = estimateOneRepMax(set.weightKg, set.reps) ?? set.weightKg;
    if (score > bestScore) return set;
    if (score === bestScore && set.weightKg > best.weightKg) return set;
    return best;
  });
}

export function isWorkoutEmpty(workout: Workout): boolean {
  return countCompletedSets(workout) === 0;
}

/** What gets stored as "last time" for an exercise, shown in grey while logging. */
export type PreviousPerformance = {
  slug: string;
  date: string;
  sets: { weightKg: number; reps: number; type: SetType }[];
};

export function toPreviousPerformance(workout: Workout): PreviousPerformance[] {
  return workout.exercises
    .map((exercise) => ({
      slug: exercise.slug,
      date: workout.endedAt ?? workout.startedAt,
      sets: exercise.sets
        .filter((set) => set.completedAt !== null)
        .map((set) => ({ weightKg: set.weightKg, reps: set.reps, type: set.type })),
    }))
    .filter((performance) => performance.sets.length > 0);
}

/** Sets the app suggests when you add another set: same as the last one you logged. */
export function nextSetTemplate(
  sets: readonly LoggedSet[],
): Pick<LoggedSet, 'weightKg' | 'reps' | 'rir' | 'type'> {
  const last = sets.at(-1);
  if (!last) return { weightKg: 0, reps: 0, rir: null, type: 'normal' };
  return { weightKg: last.weightKg, reps: last.reps, rir: last.rir, type: last.type };
}

export function isSetLoggable(set: Pick<LoggedSet, 'weightKg' | 'reps'>): boolean {
  return (
    Number.isFinite(set.weightKg) &&
    set.weightKg >= 0 &&
    set.weightKg <= 999 &&
    Number.isInteger(set.reps) &&
    set.reps >= 1 &&
    set.reps <= 999
  );
}

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
  /** Your own note ("asiento en el 4", "molestia en el hombro"). Uploaded with the workout. */
  note?: string | null;
  /** Rep range the routine or programme asks for; shown while logging, not uploaded. */
  target?: { repMin: number; repMax: number } | null;
  /** Instruction from the programme, e.g. "las repeticiones son por lado". Not uploaded. */
  hint?: string | null;
};

export const NOTE_MAX_LENGTH = 500;

export type Workout = {
  id: string;
  name: string;
  startedAt: string;
  endedAt: string | null;
  exercises: LoggedExercise[];
  /** Set when the session comes from a guided programme, e.g. "torso-pierna" and "w3-b". */
  programSlug?: string | null;
  programSession?: string | null;
};

/** A plan to start from: a past workout you repeat, a routine or a session of a programme. */
export type WorkoutTemplate = {
  name: string;
  exercises: {
    slug: string;
    sets: Pick<LoggedSet, 'type' | 'weightKg' | 'reps' | 'rir'>[];
    target?: { repMin: number; repMax: number } | null;
    hint?: string | null;
  }[];
  /** Filled in when the plan is a session of a programme. */
  programSlug?: string;
  programSession?: string;
};

/** Repeating a workout plans the same exercises and sets, ready to tick off again. */
export function workoutToTemplate(workout: Workout): WorkoutTemplate {
  return {
    name: workout.name,
    exercises: workout.exercises.map((exercise) => ({
      slug: exercise.slug,
      sets: exercise.sets.map(({ type, weightKg, reps, rir }) => ({ type, weightKg, reps, rir })),
    })),
  };
}

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

/**
 * What the set column shows: warm-ups, drops and sets to failure get a letter, normal sets are
 * numbered among themselves (so two warm-ups don't turn your first working set into "3").
 */
export function setLabel(sets: readonly Pick<LoggedSet, 'type'>[], index: number): string {
  const type = sets[index]?.type;
  if (type === 'warmup') return 'C';
  if (type === 'drop') return 'D';
  if (type === 'failure') return 'F';
  return String(sets.slice(0, index + 1).filter((item) => item.type === 'normal').length);
}

export const RIR_OPTIONS = [0, 1, 2, 3, 4, 5] as const;

/** Rest presets offered while logging, in seconds. */
export const REST_PRESETS = [60, 90, 120, 150, 180, 240] as const;

/** The next preset after `current`, wrapping around to the shortest one. */
export function nextRestPreset(current: number): number {
  return REST_PRESETS.find((preset) => preset > current) ?? REST_PRESETS[0];
}

/**
 * The copy of a finished workout that is safe to store and upload: only ticked sets the database
 * accepts, and only exercises that kept at least one of them. A single bad row would otherwise be
 * rejected on every retry and block the offline queue behind it.
 */
export function sanitizeWorkout(workout: Workout): Workout {
  const name = workout.name.trim().slice(0, 80) || 'Entreno';
  return {
    ...workout,
    name,
    exercises: workout.exercises
      .slice(0, 100)
      .map((exercise) => ({
        ...exercise,
        note: exercise.note
          ? exercise.note.trim().slice(0, NOTE_MAX_LENGTH) || null
          : exercise.note,
        sets: exercise.sets
          .filter((set) => set.completedAt !== null && isSetLoggable(set))
          .slice(0, 100)
          .map((set) => ({
            ...set,
            weightKg: Math.round(set.weightKg * 100) / 100,
            rir: set.rir === null ? null : Math.min(Math.max(Math.round(set.rir), 0), 10),
          })),
      }))
      .filter((exercise) => exercise.sets.length > 0),
  };
}

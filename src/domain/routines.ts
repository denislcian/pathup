import type { LoggedSet, PreviousPerformance, Workout, WorkoutTemplate } from '@/domain/workout';

export type RoutineExercise = {
  id: string;
  slug: string;
  /** Working sets to do. */
  sets: number;
  repMin: number;
  repMax: number;
};

export type Routine = {
  id: string;
  name: string;
  /** Optional group, e.g. "Torso / Pierna". Routines without one are listed first. */
  folder: string | null;
  position: number;
  exercises: RoutineExercise[];
};

export const ROUTINE_LIMITS = {
  nameLength: 80,
  folderLength: 40,
  exercises: 30,
  sets: { min: 1, max: 10 },
  reps: { min: 1, max: 100 },
} as const;

export const DEFAULT_SETS = 3;
export const DEFAULT_REP_RANGE = { repMin: 8, repMax: 12 } as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(Math.round(value), min), max);
}

/**
 * The session a routine plans for today. Weights and reps come from the last time you did each
 * exercise, set by set, so starting a routine is "same as last time" and you only adjust what
 * went up. Without history, reps start at the top of the range and the weight is left for you.
 */
export function routineToTemplate(
  routine: Routine,
  previous: Record<string, PreviousPerformance | undefined>,
): WorkoutTemplate {
  return {
    name: routine.name,
    exercises: routine.exercises.map((exercise) => {
      const last = previous[exercise.slug]?.sets.filter((set) => set.type !== 'warmup') ?? [];
      return {
        slug: exercise.slug,
        sets: Array.from({ length: exercise.sets }, (_, index) => {
          const reference = last[index] ?? last.at(-1);
          return {
            type: 'normal' as const,
            weightKg: reference?.weightKg ?? 0,
            reps: reference?.reps ?? exercise.repMax,
            rir: null,
          };
        }),
      };
    }),
  };
}

/**
 * A routine that repeats a workout you liked: same exercises, as many working sets as you did
 * and the rep range you actually moved in.
 */
export function routineFromWorkout(
  workout: Workout,
  createId: () => string,
  position: number,
): Routine {
  return {
    id: createId(),
    name: workout.name.slice(0, ROUTINE_LIMITS.nameLength),
    folder: null,
    position,
    exercises: workout.exercises.slice(0, ROUTINE_LIMITS.exercises).map((exercise) => {
      const working = exercise.sets.filter((set: LoggedSet) => set.type !== 'warmup');
      const reps = working.map((set) => set.reps);
      return {
        id: createId(),
        slug: exercise.slug,
        sets: clamp(working.length || 1, ROUTINE_LIMITS.sets.min, ROUTINE_LIMITS.sets.max),
        repMin: reps.length > 0 ? clamp(Math.min(...reps), 1, 100) : DEFAULT_REP_RANGE.repMin,
        repMax: reps.length > 0 ? clamp(Math.max(...reps), 1, 100) : DEFAULT_REP_RANGE.repMax,
      };
    }),
  };
}

/** A copy with new ids, placed right after the original. */
export function duplicateRoutine(
  routine: Routine,
  createId: () => string,
  suffix: string,
): Routine {
  const name = `${routine.name} ${suffix}`.slice(0, ROUTINE_LIMITS.nameLength);
  return {
    ...routine,
    id: createId(),
    name,
    position: routine.position + 1,
    exercises: routine.exercises.map((exercise) => ({ ...exercise, id: createId() })),
  };
}

export type RoutineGroup = { folder: string | null; routines: Routine[] };

/** Routines without a folder first, then each folder in alphabetical order. */
export function groupByFolder(routines: readonly Routine[]): RoutineGroup[] {
  const sorted = [...routines].sort((a, b) => a.position - b.position);
  const groups = new Map<string | null, Routine[]>();
  for (const routine of sorted) {
    const key = routine.folder?.trim() || null;
    groups.set(key, [...(groups.get(key) ?? []), routine]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => (a === null ? -1 : b === null ? 1 : a.localeCompare(b)))
    .map(([folder, items]) => ({ folder, routines: items }));
}

export function folderNames(routines: readonly Routine[]): string[] {
  return [
    ...new Set(routines.map((routine) => routine.folder?.trim()).filter((name) => !!name)),
  ].sort((a, b) => a!.localeCompare(b!)) as string[];
}

/**
 * Moves a routine one place up or down among the routines of its folder and renumbers every
 * routine 0..n-1. Returns only the routines whose position changed, which is what has to be saved.
 */
export function moveRoutine(
  routines: readonly Routine[],
  id: string,
  direction: -1 | 1,
): Routine[] {
  const sorted = [...routines].sort((a, b) => a.position - b.position);
  const target = sorted.find((routine) => routine.id === id);
  if (!target) return [];
  const folder = target.folder?.trim() || null;
  const siblings = sorted.filter((routine) => (routine.folder?.trim() || null) === folder);
  const index = siblings.indexOf(target);
  const swapWith = siblings[index + direction];
  if (!swapWith) return [];

  const order = [...sorted];
  const a = order.indexOf(target);
  const b = order.indexOf(swapWith);
  [order[a], order[b]] = [order[b], order[a]];

  return order
    .map((routine, position) => ({ ...routine, position }))
    .filter(
      (routine, position) => sorted.find((item) => item.id === routine.id)!.position !== position,
    );
}

/** Moves an exercise inside a routine being edited. */
export function moveExercise(
  exercises: readonly RoutineExercise[],
  index: number,
  direction: -1 | 1,
): RoutineExercise[] {
  const target = index + direction;
  if (target < 0 || target >= exercises.length) return [...exercises];
  const copy = [...exercises];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
}

export type RoutineIssue = 'nameRequired' | 'noExercises' | 'repRange' | 'tooManyExercises';

export function validateRoutine(routine: Pick<Routine, 'name' | 'exercises'>): RoutineIssue[] {
  const issues: RoutineIssue[] = [];
  if (routine.name.trim().length === 0) issues.push('nameRequired');
  if (routine.exercises.length === 0) issues.push('noExercises');
  if (routine.exercises.length > ROUTINE_LIMITS.exercises) issues.push('tooManyExercises');
  if (
    routine.exercises.some(
      (exercise) =>
        exercise.repMin < ROUTINE_LIMITS.reps.min ||
        exercise.repMax > ROUTINE_LIMITS.reps.max ||
        exercise.repMin > exercise.repMax,
    )
  ) {
    issues.push('repRange');
  }
  return issues;
}

/** "3 × 8-12" or "3 × 10" when the range is a single number. */
export function describePrescription(
  exercise: Pick<RoutineExercise, 'sets' | 'repMin' | 'repMax'>,
) {
  const reps =
    exercise.repMin === exercise.repMax
      ? `${exercise.repMin}`
      : `${exercise.repMin}-${exercise.repMax}`;
  return `${exercise.sets} × ${reps}`;
}

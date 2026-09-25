import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { appStorage } from '@/lib/storage';

import {
  DEFAULT_REST_SECONDS,
  isSetLoggable,
  nextSetTemplate,
  sanitizeWorkout,
  type LoggedSet,
  type Workout,
  type WorkoutTemplate,
} from '@/domain/workout';
import { createId } from '@/features/workout/ids';

type SetPatch = Partial<Pick<LoggedSet, 'weightKg' | 'reps' | 'rir' | 'type'>>;

type ActiveWorkoutState = {
  workout: Workout | null;
  /** Epoch milliseconds when the rest timer runs out, or null when no rest is running. */
  restEndsAt: number | null;
  restSeconds: number;
  start: (name: string) => void;
  /** Starts a session with its exercises and sets already planned, none of them ticked. */
  startFrom: (template: WorkoutTemplate) => void;
  discard: () => void;
  addExercise: (slug: string) => void;
  removeExercise: (exerciseId: string) => void;
  addSet: (exerciseId: string) => void;
  updateSet: (exerciseId: string, setId: string, patch: SetPatch) => void;
  /**
   * Ticks a set off, or unticks it. A set without valid weight and reps can't be ticked: it takes
   * `fallback` (last session's values) when given, and otherwise nothing changes and it returns false.
   */
  toggleSetCompleted: (
    exerciseId: string,
    setId: string,
    fallback?: Pick<LoggedSet, 'weightKg' | 'reps'>,
  ) => boolean;
  removeSet: (exerciseId: string, setId: string) => void;
  /**
   * Replaces an exercise with another one (the machine is taken, it hurts…). Only while none of
   * its sets are ticked: logged sets belong to the exercise they were done on. Returns false when
   * it cannot swap.
   */
  swapExercise: (exerciseId: string, slug: string) => boolean;
  setExerciseNote: (exerciseId: string, note: string) => void;
  setRestSeconds: (seconds: number) => void;
  extendRest: (seconds: number) => void;
  stopRest: () => void;
  /** Closes the session and returns it so the caller can store and upload it. */
  finish: () => Workout | null;
};

function mapExercise(
  workout: Workout,
  exerciseId: string,
  map: (sets: LoggedSet[]) => LoggedSet[],
): Workout {
  return {
    ...workout,
    exercises: workout.exercises.map((exercise) =>
      exercise.id === exerciseId ? { ...exercise, sets: map(exercise.sets) } : exercise,
    ),
  };
}

export const useActiveWorkout = create<ActiveWorkoutState>()(
  persist(
    (set, get) => ({
      workout: null,
      restEndsAt: null,
      restSeconds: DEFAULT_REST_SECONDS,

      start: (name) =>
        set({
          workout: {
            id: createId(),
            name,
            startedAt: new Date().toISOString(),
            endedAt: null,
            exercises: [],
          },
          restEndsAt: null,
        }),

      startFrom: (template) =>
        set({
          workout: {
            id: createId(),
            name: template.name,
            startedAt: new Date().toISOString(),
            endedAt: null,
            programSlug: template.programSlug ?? null,
            programSession: template.programSession ?? null,
            exercises: template.exercises.map((exercise) => ({
              id: createId(),
              slug: exercise.slug,
              target: exercise.target ?? null,
              hint: exercise.hint ?? null,
              sets: (exercise.sets.length > 0
                ? exercise.sets
                : [{ type: 'normal' as const, weightKg: 0, reps: 0, rir: null }]
              ).map((planned) => ({ ...planned, id: createId(), completedAt: null })),
            })),
          },
          restEndsAt: null,
        }),

      discard: () => set({ workout: null, restEndsAt: null }),

      addExercise: (slug) => {
        const { workout } = get();
        if (!workout) return;
        const exercise = {
          id: createId(),
          slug,
          sets: [
            {
              id: createId(),
              type: 'normal' as const,
              weightKg: 0,
              reps: 0,
              rir: null,
              completedAt: null,
            },
          ],
        };
        set({ workout: { ...workout, exercises: [...workout.exercises, exercise] } });
      },

      removeExercise: (exerciseId) => {
        const { workout } = get();
        if (!workout) return;
        set({
          workout: {
            ...workout,
            exercises: workout.exercises.filter((exercise) => exercise.id !== exerciseId),
          },
        });
      },

      addSet: (exerciseId) => {
        const { workout } = get();
        if (!workout) return;
        set({
          workout: mapExercise(workout, exerciseId, (sets) => [
            ...sets,
            { id: createId(), completedAt: null, ...nextSetTemplate(sets) },
          ]),
        });
      },

      updateSet: (exerciseId, setId, patch) => {
        const { workout } = get();
        if (!workout) return;
        set({
          workout: mapExercise(workout, exerciseId, (sets) =>
            sets.map((item) => (item.id === setId ? { ...item, ...patch } : item)),
          ),
        });
      },

      toggleSetCompleted: (exerciseId, setId, fallback) => {
        const { workout, restSeconds, restEndsAt } = get();
        if (!workout) return false;
        const target = workout.exercises
          .find((exercise) => exercise.id === exerciseId)
          ?.sets.find((item) => item.id === setId);
        if (!target) return false;

        const completing = target.completedAt === null;
        // Empty fields take last session's value, like the grey hint they show.
        const values = {
          weightKg: target.weightKg > 0 || !fallback ? target.weightKg : fallback.weightKg,
          reps: target.reps > 0 || !fallback ? target.reps : fallback.reps,
        };
        if (completing && !isSetLoggable(values)) return false;

        const updated = mapExercise(workout, exerciseId, (sets) =>
          sets.map((item) =>
            item.id === setId
              ? {
                  ...item,
                  ...(completing ? values : {}),
                  completedAt: completing ? new Date().toISOString() : null,
                }
              : item,
          ),
        );
        const startRest = completing && target.type !== 'warmup';
        set({
          workout: updated,
          restEndsAt: startRest ? Date.now() + restSeconds * 1000 : restEndsAt,
        });
        return true;
      },

      removeSet: (exerciseId, setId) => {
        const { workout } = get();
        if (!workout) return;
        set({
          workout: mapExercise(workout, exerciseId, (sets) =>
            sets.filter((item) => item.id !== setId),
          ),
        });
      },

      swapExercise: (exerciseId, slug) => {
        const { workout } = get();
        if (!workout) return false;
        const exercise = workout.exercises.find((item) => item.id === exerciseId);
        if (!exercise || exercise.sets.some((set) => set.completedAt !== null)) return false;
        set({
          workout: {
            ...workout,
            exercises: workout.exercises.map((item) =>
              item.id === exerciseId
                ? {
                    ...item,
                    id: createId(),
                    slug,
                    // Same number of sets and reps; the weight belonged to the old exercise.
                    sets: item.sets.map((planned) => ({
                      ...planned,
                      id: createId(),
                      weightKg: 0,
                    })),
                  }
                : item,
            ),
          },
        });
        return true;
      },

      setExerciseNote: (exerciseId, note) => {
        const { workout } = get();
        if (!workout) return;
        set({
          workout: {
            ...workout,
            exercises: workout.exercises.map((item) =>
              item.id === exerciseId ? { ...item, note } : item,
            ),
          },
        });
      },

      setRestSeconds: (seconds) => set({ restSeconds: Math.max(15, Math.min(seconds, 600)) }),

      extendRest: (seconds) => {
        const { restEndsAt } = get();
        if (restEndsAt === null) return;
        set({ restEndsAt: restEndsAt + seconds * 1000 });
      },

      stopRest: () => set({ restEndsAt: null }),

      finish: () => {
        const { workout } = get();
        if (!workout) return null;
        // Sets that were never ticked off are plans, not training: they are dropped, and so is
        // anything the database would reject.
        const finished = sanitizeWorkout({ ...workout, endedAt: new Date().toISOString() });
        set({ workout: null, restEndsAt: null });
        return finished;
      },
    }),
    {
      name: 'pathup.workouts.active.v1',
      storage: createJSONStorage(() => appStorage),
      partialize: ({ workout, restEndsAt, restSeconds }) => ({ workout, restEndsAt, restSeconds }),
    },
  ),
);

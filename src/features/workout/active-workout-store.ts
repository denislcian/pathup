import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { appStorage } from '@/lib/storage';

import {
  DEFAULT_REST_SECONDS,
  nextSetTemplate,
  type LoggedSet,
  type Workout,
} from '@/domain/workout';
import { createId } from '@/features/workout/ids';

type SetPatch = Partial<Pick<LoggedSet, 'weightKg' | 'reps' | 'rir' | 'type'>>;

type ActiveWorkoutState = {
  workout: Workout | null;
  /** Epoch milliseconds when the rest timer runs out, or null when no rest is running. */
  restEndsAt: number | null;
  restSeconds: number;
  start: (name: string) => void;
  discard: () => void;
  addExercise: (slug: string) => void;
  removeExercise: (exerciseId: string) => void;
  addSet: (exerciseId: string) => void;
  updateSet: (exerciseId: string, setId: string, patch: SetPatch) => void;
  toggleSetCompleted: (exerciseId: string, setId: string) => void;
  removeSet: (exerciseId: string, setId: string) => void;
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

      toggleSetCompleted: (exerciseId, setId) => {
        const { workout, restSeconds, restEndsAt } = get();
        if (!workout) return;
        let startRest = false;
        const updated = mapExercise(workout, exerciseId, (sets) =>
          sets.map((item) => {
            if (item.id !== setId) return item;
            const completing = item.completedAt === null;
            startRest = completing && item.type !== 'warmup';
            return { ...item, completedAt: completing ? new Date().toISOString() : null };
          }),
        );
        set({
          workout: updated,
          restEndsAt: startRest ? Date.now() + restSeconds * 1000 : restEndsAt,
        });
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
        const finished: Workout = {
          ...workout,
          endedAt: new Date().toISOString(),
          // Sets that were never ticked off are plans, not training: they are dropped.
          exercises: workout.exercises
            .map((exercise) => ({
              ...exercise,
              sets: exercise.sets.filter((item) => item.completedAt !== null),
            }))
            .filter((exercise) => exercise.sets.length > 0),
        };
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

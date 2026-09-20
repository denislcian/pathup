import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { appStorage } from '@/lib/storage';

import type { Workout } from '@/domain/workout';

type FinishedWorkoutState = {
  /** The workout shown on the summary screen right after finishing. */
  workout: Workout | null;
  synced: boolean;
  setFinished: (workout: Workout, synced: boolean) => void;
  clear: () => void;
};

export const useFinishedWorkout = create<FinishedWorkoutState>()(
  persist(
    (set) => ({
      workout: null,
      synced: false,
      setFinished: (workout, synced) => set({ workout, synced }),
      clear: () => set({ workout: null, synced: false }),
    }),
    {
      name: 'pathup.workouts.finished.v1',
      storage: createJSONStorage(() => appStorage),
    },
  ),
);

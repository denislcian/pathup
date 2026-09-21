import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { appStorage } from '@/lib/storage';

import type { RecordHit } from '@/domain/progress';
import type { Workout } from '@/domain/workout';

type FinishedWorkoutState = {
  /** The workout shown on the summary screen right after finishing. */
  workout: Workout | null;
  synced: boolean;
  /** Personal records beaten in this workout. */
  records: RecordHit[];
  setFinished: (workout: Workout, synced: boolean, records?: RecordHit[]) => void;
  clear: () => void;
};

export const useFinishedWorkout = create<FinishedWorkoutState>()(
  persist(
    (set) => ({
      workout: null,
      synced: false,
      records: [],
      setFinished: (workout, synced, records = []) => set({ workout, synced, records }),
      clear: () => set({ workout: null, synced: false, records: [] }),
    }),
    {
      name: 'pathup.workouts.finished.v1',
      storage: createJSONStorage(() => appStorage),
    },
  ),
);

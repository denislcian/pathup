import { create } from 'zustand';

import {
  DEFAULT_REP_RANGE,
  DEFAULT_SETS,
  moveExercise,
  ROUTINE_LIMITS,
  type Routine,
  type RoutineExercise,
} from '@/domain/routines';
import { createId } from '@/features/workout/ids';

type RoutineDraftState = {
  /** The routine open in the editor, or null when nothing is being edited. */
  draft: Routine | null;
  /** True when the routine already exists (edit), false for a new one. */
  existing: boolean;
  open: (routine: Routine, existing: boolean) => void;
  close: () => void;
  update: (patch: Partial<Pick<Routine, 'name' | 'folder'>>) => void;
  addExercise: (slug: string) => void;
  updateExercise: (index: number, patch: Partial<Omit<RoutineExercise, 'id' | 'slug'>>) => void;
  removeExercise: (index: number) => void;
  moveExercise: (index: number, direction: -1 | 1) => void;
};

/** A blank routine placed after the ones you already have. */
export function newRoutine(position: number): Routine {
  return { id: createId(), name: '', folder: null, position, exercises: [] };
}

/**
 * The routine being edited lives here rather than in the screen, so the exercise picker (a
 * separate screen) can add to it. It is not persisted: an edit is a few seconds of work.
 */
export const useRoutineDraft = create<RoutineDraftState>()((set, get) => {
  const edit = (map: (routine: Routine) => Routine) => {
    const { draft } = get();
    if (draft) set({ draft: map(draft) });
  };

  return {
    draft: null,
    existing: false,
    open: (routine, existing) => set({ draft: copyRoutine(routine), existing }),
    close: () => set({ draft: null, existing: false }),
    update: (patch) => edit((routine) => ({ ...routine, ...patch })),
    addExercise: (slug) =>
      edit((routine) =>
        routine.exercises.length >= ROUTINE_LIMITS.exercises
          ? routine
          : {
              ...routine,
              exercises: [
                ...routine.exercises,
                { id: createId(), slug, sets: DEFAULT_SETS, ...DEFAULT_REP_RANGE },
              ],
            },
      ),
    updateExercise: (index, patch) =>
      edit((routine) => ({
        ...routine,
        exercises: routine.exercises.map((exercise, position) =>
          position === index ? { ...exercise, ...patch } : exercise,
        ),
      })),
    removeExercise: (index) =>
      edit((routine) => ({
        ...routine,
        exercises: routine.exercises.filter((_, position) => position !== index),
      })),
    moveExercise: (index, direction) =>
      edit((routine) => ({
        ...routine,
        exercises: moveExercise(routine.exercises, index, direction),
      })),
  };
});

function copyRoutine(routine: Routine): Routine {
  return { ...routine, exercises: routine.exercises.map((exercise) => ({ ...exercise })) };
}

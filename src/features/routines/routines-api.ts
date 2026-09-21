import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Routine } from '@/domain/routines';
import { useAuth } from '@/features/auth/auth-provider';
import { demoBackend } from '@/lib/demo-backend';
import { isDemoMode } from '@/lib/demo-mode';
import { isSupabaseConfigured, requireSupabase } from '@/lib/supabase';

const SNAPSHOT_KEY = 'pathup.routines.v1';

export const routineKeys = {
  all: (userId: string | undefined) => ['routines', userId] as const,
};

type RoutineRow = {
  id: string;
  name: string;
  folder: string | null;
  position: number;
  routine_exercises: {
    id: string;
    exercise_slug: string;
    position: number;
    target_sets: number;
    rep_min: number;
    rep_max: number;
  }[];
};

export function toRoutine(row: RoutineRow): Routine {
  return {
    id: row.id,
    name: row.name,
    folder: row.folder,
    position: row.position,
    exercises: [...row.routine_exercises]
      .sort((a, b) => a.position - b.position)
      .map((exercise) => ({
        id: exercise.id,
        slug: exercise.exercise_slug,
        sets: exercise.target_sets,
        repMin: exercise.rep_min,
        repMax: exercise.rep_max,
      })),
  };
}

async function readSnapshot(): Promise<Routine[]> {
  try {
    const raw = await AsyncStorage.getItem(SNAPSHOT_KEY);
    return raw ? (JSON.parse(raw) as Routine[]) : [];
  } catch {
    return [];
  }
}

async function writeSnapshot(routines: Routine[]): Promise<void> {
  await AsyncStorage.setItem(SNAPSHOT_KEY, JSON.stringify(routines));
}

/** Forgets the routines stored on this phone (signing out). */
export async function clearLocalRoutines(): Promise<void> {
  await AsyncStorage.removeItem(SNAPSHOT_KEY);
}

export async function fetchRoutines(): Promise<Routine[]> {
  if (isDemoMode()) return demoBackend.listRoutines();

  const { data, error } = await requireSupabase()
    .from('routines')
    .select(
      'id, name, folder, position, routine_exercises ( id, exercise_slug, position, target_sets, rep_min, rep_max )',
    )
    .order('position', { ascending: true });
  if (error) throw error;
  return (data as unknown as RoutineRow[]).map(toRoutine);
}

export type RoutineList = { routines: Routine[]; offline: boolean };

/** Routines from the server, with a copy on the phone so you can start one at the gym. */
export async function loadRoutines(): Promise<RoutineList> {
  try {
    if (!isSupabaseConfigured && !isDemoMode()) throw new Error('not configured');
    const routines = await fetchRoutines();
    await writeSnapshot(routines);
    return { routines, offline: false };
  } catch {
    return { routines: await readSnapshot(), offline: true };
  }
}

async function rememberLocally(changed: Routine[], removedId?: string): Promise<void> {
  const byId = new Map((await readSnapshot()).map((routine) => [routine.id, routine]));
  for (const routine of changed) byId.set(routine.id, routine);
  if (removedId) byId.delete(removedId);
  await writeSnapshot([...byId.values()]);
}

/**
 * Saves a routine and its exercises. Ids come from the phone, so saving twice updates the same
 * rows. Exercises removed in the editor are deleted first.
 */
export async function saveRoutine(userId: string, routine: Routine): Promise<void> {
  if (isDemoMode()) {
    demoBackend.saveRoutine(routine);
  } else {
    const supabase = requireSupabase();
    const { error } = await supabase.from('routines').upsert({
      id: routine.id,
      user_id: userId,
      name: routine.name.trim(),
      folder: routine.folder?.trim() || null,
      position: routine.position,
    });
    if (error) throw error;

    const keep = routine.exercises.map((exercise) => exercise.id);
    let removal = supabase.from('routine_exercises').delete().eq('routine_id', routine.id);
    if (keep.length > 0) removal = removal.not('id', 'in', `(${keep.join(',')})`);
    const { error: removeError } = await removal;
    if (removeError) throw removeError;

    if (routine.exercises.length > 0) {
      const { error: exercisesError } = await supabase.from('routine_exercises').upsert(
        routine.exercises.map((exercise, position) => ({
          id: exercise.id,
          routine_id: routine.id,
          user_id: userId,
          exercise_slug: exercise.slug,
          position,
          target_sets: exercise.sets,
          rep_min: exercise.repMin,
          rep_max: exercise.repMax,
        })),
      );
      if (exercisesError) throw exercisesError;
    }
  }
  await rememberLocally([routine]);
}

/** Saves only the new order of the routines that moved. */
export async function saveRoutineOrder(userId: string, changed: Routine[]): Promise<void> {
  if (changed.length === 0) return;
  if (isDemoMode()) {
    for (const routine of changed) demoBackend.saveRoutine(routine);
  } else {
    const { error } = await requireSupabase()
      .from('routines')
      .upsert(
        changed.map((routine) => ({
          id: routine.id,
          user_id: userId,
          name: routine.name,
          folder: routine.folder,
          position: routine.position,
        })),
      );
    if (error) throw error;
  }
  await rememberLocally(changed);
}

export async function deleteRoutine(routineId: string): Promise<void> {
  if (isDemoMode()) {
    demoBackend.deleteRoutine(routineId);
  } else {
    // Its exercises go with it (on delete cascade).
    const { error } = await requireSupabase().from('routines').delete().eq('id', routineId);
    if (error) throw error;
  }
  await rememberLocally([], routineId);
}

export function useRoutines() {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: routineKeys.all(userId),
    queryFn: loadRoutines,
    enabled: Boolean(userId),
  });
}

function useRoutineMutation<T>(run: (userId: string, input: T) => Promise<void>) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const userId = session?.user.id;

  return useMutation({
    mutationFn: (input: T) => {
      if (!userId) throw new Error('No session');
      return run(userId, input);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: routineKeys.all(userId) }),
  });
}

export function useSaveRoutine() {
  return useRoutineMutation(saveRoutine);
}

export function useSaveRoutineOrder() {
  return useRoutineMutation(saveRoutineOrder);
}

export function useDeleteRoutine() {
  return useRoutineMutation((_userId: string, routineId: string) => deleteRoutine(routineId));
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Habit, HabitLog } from '@/domain/habits';
import { useAuth } from '@/features/auth/auth-provider';
import { demoBackend } from '@/lib/demo-backend';
import { isDemoMode } from '@/lib/demo-mode';
import { isSupabaseConfigured, requireSupabase } from '@/lib/supabase';

const SNAPSHOT_KEY = 'pathup.habits.v1';
/** Logs further back than this are not needed for streaks worth showing. */
const LOG_DAYS = 120;

export const habitKeys = {
  all: (userId: string | undefined) => ['habits', userId] as const,
};

export type HabitData = { habits: Habit[]; logs: HabitLog[]; offline: boolean };

async function readSnapshot(): Promise<Omit<HabitData, 'offline'>> {
  try {
    const raw = await AsyncStorage.getItem(SNAPSHOT_KEY);
    return raw ? (JSON.parse(raw) as Omit<HabitData, 'offline'>) : { habits: [], logs: [] };
  } catch {
    return { habits: [], logs: [] };
  }
}

async function writeSnapshot(data: Omit<HabitData, 'offline'>): Promise<void> {
  await AsyncStorage.setItem(SNAPSHOT_KEY, JSON.stringify(data));
}

export async function clearLocalHabits(): Promise<void> {
  await AsyncStorage.removeItem(SNAPSHOT_KEY);
}

function since(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export async function fetchHabits(): Promise<Omit<HabitData, 'offline'>> {
  if (isDemoMode()) return demoBackend.listHabits();

  const supabase = requireSupabase();
  const [habits, logs] = await Promise.all([
    supabase
      .from('habits')
      .select('id, name, target, unit, position')
      .order('position', { ascending: true }),
    supabase.from('habit_logs').select('habit_id, day, count').gte('day', since(LOG_DAYS)),
  ]);
  if (habits.error) throw habits.error;
  if (logs.error) throw logs.error;
  return {
    habits: habits.data,
    logs: logs.data.map((row) => ({ habitId: row.habit_id, date: row.day, count: row.count })),
  };
}

/** Habits and their recent logs, with a copy on the phone for when there is no signal. */
export async function loadHabits(): Promise<HabitData> {
  try {
    if (!isSupabaseConfigured && !isDemoMode()) throw new Error('not configured');
    const data = await fetchHabits();
    await writeSnapshot(data);
    return { ...data, offline: false };
  } catch {
    return { ...(await readSnapshot()), offline: true };
  }
}

export async function saveHabit(userId: string, habit: Habit): Promise<void> {
  if (isDemoMode()) {
    demoBackend.saveHabit(habit);
    return;
  }
  const { error } = await requireSupabase()
    .from('habits')
    .upsert({
      id: habit.id,
      user_id: userId,
      name: habit.name.trim(),
      target: habit.target,
      unit: habit.unit?.trim() || null,
      position: habit.position,
    });
  if (error) throw error;
}

export async function deleteHabit(habitId: string): Promise<void> {
  if (isDemoMode()) {
    demoBackend.deleteHabit(habitId);
    return;
  }
  // Its logs go with it (on delete cascade).
  const { error } = await requireSupabase().from('habits').delete().eq('id', habitId);
  if (error) throw error;
}

export async function setHabitCount(userId: string, log: HabitLog): Promise<void> {
  if (isDemoMode()) {
    demoBackend.logHabit(log);
    return;
  }
  const { error } = await requireSupabase()
    .from('habit_logs')
    .upsert(
      { habit_id: log.habitId, user_id: userId, day: log.date, count: log.count },
      { onConflict: 'habit_id,day' },
    );
  if (error) throw error;
}

export function useHabits() {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: habitKeys.all(userId),
    queryFn: loadHabits,
    enabled: Boolean(userId),
  });
}

function withLog(logs: readonly HabitLog[], log: HabitLog): HabitLog[] {
  return [...logs.filter((item) => !(item.habitId === log.habitId && item.date === log.date)), log];
}

/**
 * Ticking a habit should feel instant: the count changes on screen straight away and goes back
 * if the server refuses it.
 */
export function useLogHabit() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const userId = session?.user.id;
  const key = habitKeys.all(userId);

  return useMutation({
    mutationFn: (log: HabitLog) => {
      if (!userId) throw new Error('No session');
      return setHabitCount(userId, log);
    },
    onMutate: async (log) => {
      await queryClient.cancelQueries({ queryKey: key });
      const before = queryClient.getQueryData<HabitData>(key);
      if (before)
        queryClient.setQueryData<HabitData>(key, { ...before, logs: withLog(before.logs, log) });
      return { before };
    },
    onError: (_error, _log, context) => {
      if (context?.before) queryClient.setQueryData(key, context.before);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useSaveHabit() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const userId = session?.user.id;

  return useMutation({
    mutationFn: (habit: Habit) => {
      if (!userId) throw new Error('No session');
      return saveHabit(userId, habit);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: habitKeys.all(userId) }),
  });
}

export function useDeleteHabit() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteHabit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: habitKeys.all(session?.user.id) }),
  });
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { readinessScore, type Checkin } from '@/domain/wellness';
import { useAuth } from '@/features/auth/auth-provider';
import { demoBackend } from '@/lib/demo-backend';
import { isDemoMode } from '@/lib/demo-mode';
import { isSupabaseConfigured, requireSupabase } from '@/lib/supabase';

const SNAPSHOT_KEY = 'pathup.wellness.v1';
/** Enough for the charts and the streak; a year of daily check-ins. */
const LIMIT = 400;

export const wellnessKeys = {
  all: (userId: string | undefined) => ['wellness', userId] as const,
};

type CheckinRow = {
  day: string;
  sleep_hours: number;
  sleep_quality: number;
  energy: number;
  stress: number;
  soreness: number;
  mood: number;
  note: string | null;
};

export function toCheckin(row: CheckinRow): Checkin {
  return {
    date: row.day,
    sleepHours: Number(row.sleep_hours),
    sleepQuality: row.sleep_quality,
    energy: row.energy,
    stress: row.stress,
    soreness: row.soreness,
    mood: row.mood,
    note: row.note,
  };
}

async function readSnapshot(): Promise<Checkin[]> {
  try {
    const raw = await AsyncStorage.getItem(SNAPSHOT_KEY);
    return raw ? (JSON.parse(raw) as Checkin[]) : [];
  } catch {
    return [];
  }
}

async function writeSnapshot(checkins: Checkin[]): Promise<void> {
  await AsyncStorage.setItem(SNAPSHOT_KEY, JSON.stringify(checkins));
}

export async function clearLocalWellness(): Promise<void> {
  await AsyncStorage.removeItem(SNAPSHOT_KEY);
}

export async function fetchCheckins(): Promise<Checkin[]> {
  if (isDemoMode()) return demoBackend.listCheckins();

  const { data, error } = await requireSupabase()
    .from('wellness_checkins')
    .select('day, sleep_hours, sleep_quality, energy, stress, soreness, mood, note')
    .order('day', { ascending: false })
    .limit(LIMIT);
  if (error) throw error;
  return (data as unknown as CheckinRow[]).map(toCheckin);
}

export type CheckinList = { checkins: Checkin[]; offline: boolean };

/** Newest first, with a copy on the phone so the streak survives a day without signal. */
export async function loadCheckins(): Promise<CheckinList> {
  try {
    if (!isSupabaseConfigured && !isDemoMode()) throw new Error('not configured');
    const checkins = await fetchCheckins();
    await writeSnapshot(checkins);
    return { checkins, offline: false };
  } catch {
    return { checkins: await readSnapshot(), offline: true };
  }
}

/** Saves the day. Checking in twice the same day replaces the answers. */
export async function saveCheckin(userId: string, checkin: Checkin): Promise<void> {
  if (isDemoMode()) {
    demoBackend.saveCheckin(checkin);
  } else {
    const { error } = await requireSupabase()
      .from('wellness_checkins')
      .upsert(
        {
          user_id: userId,
          day: checkin.date,
          sleep_hours: checkin.sleepHours,
          sleep_quality: checkin.sleepQuality,
          energy: checkin.energy,
          stress: checkin.stress,
          soreness: checkin.soreness,
          mood: checkin.mood,
          readiness: readinessScore(checkin),
          note: checkin.note ?? null,
        },
        { onConflict: 'user_id,day' },
      );
    if (error) throw error;
  }
  const others = (await readSnapshot()).filter((item) => item.date !== checkin.date);
  await writeSnapshot([checkin, ...others].sort((a, b) => b.date.localeCompare(a.date)));
}

export function useCheckins() {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: wellnessKeys.all(userId),
    queryFn: loadCheckins,
    enabled: Boolean(userId),
  });
}

export function useSaveCheckin() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const userId = session?.user.id;

  return useMutation({
    mutationFn: (checkin: Checkin) => {
      if (!userId) throw new Error('No session');
      return saveCheckin(userId, checkin);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: wellnessKeys.all(userId) }),
  });
}

/** Today's check-in, if it is already done. */
export function useTodayCheckin(today: string): { checkin: Checkin | null; isPending: boolean } {
  const query = useCheckins();
  return {
    checkin: query.data?.checkins.find((item) => item.date === today) ?? null,
    isPending: query.isPending,
  };
}

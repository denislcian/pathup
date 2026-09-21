import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Measurement } from '@/domain/measurements';
import { useAuth } from '@/features/auth/auth-provider';
import type { Database } from '@/lib/database.types';
import { demoBackend } from '@/lib/demo-backend';
import { isDemoMode } from '@/lib/demo-mode';
import { isSupabaseConfigured, requireSupabase } from '@/lib/supabase';

const SNAPSHOT_KEY = 'pathup.measurements.v1';

export const measurementKeys = {
  all: (userId: string | undefined) => ['measurements', userId] as const,
};

/** App field ↔ database column. */
const COLUMNS = {
  weightKg: 'weight_kg',
  bodyFatPct: 'body_fat_pct',
  waistCm: 'waist_cm',
  hipsCm: 'hips_cm',
  chestCm: 'chest_cm',
  armCm: 'arm_cm',
  thighCm: 'thigh_cm',
  neckCm: 'neck_cm',
} as const;

type MeasurementRow = { measured_on: string } & Record<
  (typeof COLUMNS)[keyof typeof COLUMNS],
  number | null
>;

export function toMeasurement(row: MeasurementRow): Measurement {
  const entry: Measurement = { date: row.measured_on };
  for (const [field, column] of Object.entries(COLUMNS) as [keyof typeof COLUMNS, string][]) {
    const value = row[column as keyof MeasurementRow];
    entry[field] = value === null || value === undefined ? null : Number(value);
  }
  return entry;
}

type MeasurementInsert = Database['public']['Tables']['body_measurements']['Insert'];

function toRow(userId: string, entry: Measurement): MeasurementInsert {
  return {
    user_id: userId,
    measured_on: entry.date,
    weight_kg: entry.weightKg ?? null,
    body_fat_pct: entry.bodyFatPct ?? null,
    waist_cm: entry.waistCm ?? null,
    hips_cm: entry.hipsCm ?? null,
    chest_cm: entry.chestCm ?? null,
    arm_cm: entry.armCm ?? null,
    thigh_cm: entry.thighCm ?? null,
    neck_cm: entry.neckCm ?? null,
  };
}

async function readSnapshot(): Promise<Measurement[]> {
  try {
    const raw = await AsyncStorage.getItem(SNAPSHOT_KEY);
    return raw ? (JSON.parse(raw) as Measurement[]) : [];
  } catch {
    return [];
  }
}

async function writeSnapshot(measurements: Measurement[]): Promise<void> {
  await AsyncStorage.setItem(SNAPSHOT_KEY, JSON.stringify(measurements));
}

export async function clearLocalMeasurements(): Promise<void> {
  await AsyncStorage.removeItem(SNAPSHOT_KEY);
}

export async function fetchMeasurements(): Promise<Measurement[]> {
  if (isDemoMode()) return demoBackend.listMeasurements();

  const { data, error } = await requireSupabase()
    .from('body_measurements')
    .select(`measured_on, ${Object.values(COLUMNS).join(', ')}`)
    .order('measured_on', { ascending: false });
  if (error) throw error;
  return (data as unknown as MeasurementRow[]).map(toMeasurement);
}

export type MeasurementList = { measurements: Measurement[]; offline: boolean };

/** Newest first, with a copy on the phone for when there is no signal. */
export async function loadMeasurements(): Promise<MeasurementList> {
  try {
    if (!isSupabaseConfigured && !isDemoMode()) throw new Error('not configured');
    const measurements = await fetchMeasurements();
    await writeSnapshot(measurements);
    return { measurements, offline: false };
  } catch {
    return { measurements: await readSnapshot(), offline: true };
  }
}

/** Saves a day. Saving the same day again replaces it (one row per user and day). */
export async function saveMeasurement(userId: string, entry: Measurement): Promise<void> {
  if (isDemoMode()) {
    demoBackend.saveMeasurement(entry);
  } else {
    const { error } = await requireSupabase()
      .from('body_measurements')
      .upsert(toRow(userId, entry), { onConflict: 'user_id,measured_on' });
    if (error) throw error;
  }
  const others = (await readSnapshot()).filter((item) => item.date !== entry.date);
  await writeSnapshot([entry, ...others].sort((a, b) => b.date.localeCompare(a.date)));
}

export async function deleteMeasurement(date: string): Promise<void> {
  if (isDemoMode()) {
    demoBackend.deleteMeasurement(date);
  } else {
    const { error } = await requireSupabase()
      .from('body_measurements')
      .delete()
      .eq('measured_on', date);
    if (error) throw error;
  }
  await writeSnapshot((await readSnapshot()).filter((item) => item.date !== date));
}

export function useMeasurements() {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: measurementKeys.all(userId),
    queryFn: loadMeasurements,
    enabled: Boolean(userId),
  });
}

export function useSaveMeasurement() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const userId = session?.user.id;

  return useMutation({
    mutationFn: (entry: Measurement) => {
      if (!userId) throw new Error('No session');
      return saveMeasurement(userId, entry);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: measurementKeys.all(userId) }),
  });
}

export function useDeleteMeasurement() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMeasurement,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: measurementKeys.all(session?.user.id) }),
  });
}

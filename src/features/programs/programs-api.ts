import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getProgram } from '@/data/programs';
import {
  nextPlannedSession,
  programProgress,
  type PlannedSession,
  type Program,
  type ProgramProgress,
} from '@/domain/programs';
import type { Workout } from '@/domain/workout';
import { useAuth } from '@/features/auth/auth-provider';
import { useWorkoutHistory } from '@/features/history/history-api';
import { createId } from '@/features/workout/ids';
import { demoBackend } from '@/lib/demo-backend';
import { isDemoMode } from '@/lib/demo-mode';
import { isSupabaseConfigured, requireSupabase } from '@/lib/supabase';

const SNAPSHOT_KEY = 'pathup.program.v1';

export const programKeys = {
  enrollment: (userId: string | undefined) => ['program-enrollment', userId] as const,
};

export type Enrollment = {
  id: string;
  programSlug: string;
  startedOn: string;
  status: 'active' | 'finished' | 'abandoned';
};

async function readSnapshot(): Promise<Enrollment | null> {
  try {
    const raw = await AsyncStorage.getItem(SNAPSHOT_KEY);
    return raw ? (JSON.parse(raw) as Enrollment) : null;
  } catch {
    return null;
  }
}

async function writeSnapshot(enrollment: Enrollment | null): Promise<void> {
  if (enrollment) await AsyncStorage.setItem(SNAPSHOT_KEY, JSON.stringify(enrollment));
  else await AsyncStorage.removeItem(SNAPSHOT_KEY);
}

export async function clearLocalProgram(): Promise<void> {
  await AsyncStorage.removeItem(SNAPSHOT_KEY);
}

export async function fetchActiveEnrollment(): Promise<Enrollment | null> {
  if (isDemoMode()) return demoBackend.getEnrollment();

  const { data, error } = await requireSupabase()
    .from('program_enrollments')
    .select('id, program_slug, started_on, status')
    .eq('status', 'active')
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    programSlug: data.program_slug,
    startedOn: data.started_on,
    status: data.status as Enrollment['status'],
  };
}

/** The programme you are following, with a copy on the phone so the gym works without signal. */
export async function loadEnrollment(): Promise<{
  enrollment: Enrollment | null;
  offline: boolean;
}> {
  try {
    if (!isSupabaseConfigured && !isDemoMode()) throw new Error('not configured');
    const enrollment = await fetchActiveEnrollment();
    await writeSnapshot(enrollment);
    return { enrollment, offline: false };
  } catch {
    return { enrollment: await readSnapshot(), offline: true };
  }
}

async function setStatus(id: string, status: Enrollment['status']): Promise<void> {
  if (isDemoMode()) {
    demoBackend.setEnrollmentStatus(id, status);
    return;
  }
  const { error } = await requireSupabase()
    .from('program_enrollments')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
}

/** Leaves the programme you were on, if any, and starts the new one. */
export async function startProgram(userId: string, programSlug: string): Promise<Enrollment> {
  const current = await fetchActiveEnrollment();
  if (current) await setStatus(current.id, 'abandoned');

  const enrollment: Enrollment = {
    id: createId(),
    programSlug,
    startedOn: new Date().toISOString().slice(0, 10),
    status: 'active',
  };

  if (isDemoMode()) {
    demoBackend.saveEnrollment(enrollment);
  } else {
    const { error } = await requireSupabase().from('program_enrollments').insert({
      id: enrollment.id,
      user_id: userId,
      program_slug: enrollment.programSlug,
      started_on: enrollment.startedOn,
    });
    if (error) throw error;
  }
  await writeSnapshot(enrollment);
  return enrollment;
}

export async function leaveProgram(
  id: string,
  status: 'finished' | 'abandoned' = 'abandoned',
): Promise<void> {
  await setStatus(id, status);
  await writeSnapshot(null);
}

/** Session keys of a programme already trained, read from the workouts themselves. */
export function doneSessionKeys(workouts: readonly Workout[], programSlug: string): string[] {
  return workouts
    .filter((workout) => workout.programSlug === programSlug && workout.programSession)
    .map((workout) => workout.programSession!);
}

export function useEnrollment() {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: programKeys.enrollment(userId),
    queryFn: loadEnrollment,
    enabled: Boolean(userId),
  });
}

export type ProgramState = {
  program: Program | null;
  enrollment: Enrollment | null;
  progress: ProgramProgress | null;
  next: PlannedSession | null;
  doneKeys: string[];
  isPending: boolean;
};

/** Everything a screen needs about the current programme: which one, how far and what is next. */
export function useProgramState(): ProgramState {
  const enrollmentQuery = useEnrollment();
  const history = useWorkoutHistory();

  const enrollment = enrollmentQuery.data?.enrollment ?? null;
  const program = enrollment ? (getProgram(enrollment.programSlug) ?? null) : null;
  const doneKeys = program ? doneSessionKeys(history.data?.workouts ?? [], program.slug) : [];

  return {
    program,
    enrollment,
    progress: program ? programProgress(program, doneKeys) : null,
    next: program ? nextPlannedSession(program, doneKeys) : null,
    doneKeys,
    isPending: enrollmentQuery.isPending || history.isPending,
  };
}

export function useStartProgram() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const userId = session?.user.id;

  return useMutation({
    mutationFn: (programSlug: string) => {
      if (!userId) throw new Error('No session');
      return startProgram(userId, programSlug);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: programKeys.enrollment(userId) }),
  });
}

export function useLeaveProgram() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status?: 'finished' | 'abandoned' }) =>
      leaveProgram(id, status),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: programKeys.enrollment(session?.user.id) }),
  });
}

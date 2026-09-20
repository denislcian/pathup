import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useAuth } from '@/features/auth/auth-provider';
import { readOutbox } from '@/features/workout/workout-storage';
import { flushOutbox } from '@/features/workout/workout-sync';
import { isSupabaseConfigured } from '@/lib/supabase';

/**
 * Keeps the offline queue moving: on mount, whenever the app comes back to the foreground and
 * when the screen asks for it. Returns how many workouts are still waiting to upload.
 */
export function useWorkoutSync() {
  const { session } = useAuth();
  const userId = session?.user.id;

  const query = useQuery({
    queryKey: ['workout-outbox', userId],
    queryFn: async () => {
      if (userId && isSupabaseConfigured) {
        const result = await flushOutbox(userId);
        return result.pending;
      }
      return (await readOutbox()).length;
    },
    staleTime: 10_000,
  });

  const { refetch } = query;
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refetch();
    });
    return () => subscription.remove();
  }, [refetch]);

  return { pending: query.data ?? 0, sync: () => refetch() };
}

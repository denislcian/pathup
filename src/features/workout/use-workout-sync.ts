import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useAuth } from '@/features/auth/auth-provider';
import { historyKeys } from '@/features/history/history-api';
import { readOutbox } from '@/features/workout/workout-storage';
import { flushOutbox } from '@/features/workout/workout-sync';
import { isDemoMode } from '@/lib/demo-mode';
import { isSupabaseConfigured } from '@/lib/supabase';

/**
 * Keeps the offline queue moving: on mount, whenever the app comes back to the foreground and
 * when the screen asks for it. Returns how many workouts are still waiting to upload.
 */
export function useWorkoutSync() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['workout-outbox', userId],
    queryFn: async () => {
      if (userId && (isSupabaseConfigured || isDemoMode())) {
        const result = await flushOutbox(userId);
        if (result.uploaded > 0) {
          await queryClient.invalidateQueries({ queryKey: historyKeys.all(userId) });
        }
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

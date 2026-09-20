import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/auth-provider';
import { DEMO_PROFILE, isDemoMode } from '@/lib/demo-mode';
import type { Database } from '@/lib/database.types';
import { requireSupabase } from '@/lib/supabase';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export const profileKeys = {
  detail: (userId: string | undefined) => ['profile', userId] as const,
};

export async function fetchProfile(userId: string): Promise<Profile> {
  const { data, error } = await requireSupabase()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, patch: ProfileUpdate): Promise<Profile> {
  const { data, error } = await requireSupabase()
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export function useProfile() {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: profileKeys.detail(userId),
    queryFn: () => (isDemoMode() ? DEMO_PROFILE : fetchProfile(userId!)),
    enabled: Boolean(userId),
  });
}

export function useUpdateProfile() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const userId = session?.user.id;

  return useMutation({
    mutationFn: (patch: ProfileUpdate) => updateProfile(userId!, patch),
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKeys.detail(userId), profile);
    },
  });
}

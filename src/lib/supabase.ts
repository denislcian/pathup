import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import type { Database } from '@/lib/database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

/** False until `.env.local` provides the project URL and publishable key (see docs/04-paso-a-paso-fase-0.md). */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export type PathUpSupabase = SupabaseClient<Database>;

export const supabase: PathUpSupabase | null = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl!, supabaseKey!, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
      },
    })
  : null;

export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super('Supabase is not configured');
    this.name = 'SupabaseNotConfiguredError';
  }
}

export function requireSupabase(): PathUpSupabase {
  if (!supabase) throw new SupabaseNotConfiguredError();
  return supabase;
}

// On native, only refresh the session while the app is in the foreground.
if (supabase && Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      void supabase.auth.startAutoRefresh();
    } else {
      void supabase.auth.stopAutoRefresh();
    }
  });
}

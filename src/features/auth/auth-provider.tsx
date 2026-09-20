import type { Session } from '@supabase/supabase-js';
import { createContext, use, useEffect, useState, type ReactNode } from 'react';

import { DEMO_SESSION, isDemoMode } from '@/lib/demo-mode';
import { supabase } from '@/lib/supabase';

type AuthState = {
  session: Session | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthState>({ session: null, isLoading: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const demo = isDemoMode();
  const [state, setState] = useState<AuthState>({
    session: demo ? (DEMO_SESSION as unknown as Session) : null,
    isLoading: !demo && supabase !== null,
  });

  useEffect(() => {
    if (!supabase || demo) return;
    let active = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (active) setState({ session: data.session, isLoading: false });
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setState({ session, isLoading: false });
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [demo]);

  return <AuthContext value={state}>{children}</AuthContext>;
}

export function useAuth(): AuthState {
  return use(AuthContext);
}

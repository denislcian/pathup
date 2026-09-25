import type { Session } from '@supabase/supabase-js';
import { createContext, use, useEffect, useState, type ReactNode } from 'react';

import { DEMO_SESSION, useDemoMode } from '@/lib/demo-mode';
import { supabase } from '@/lib/supabase';

type AuthState = {
  session: Session | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthState>({ session: null, isLoading: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const demo = useDemoMode();
  const [state, setState] = useState<AuthState>({
    session: null,
    isLoading: supabase !== null,
  });

  useEffect(() => {
    if (!supabase) return;
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
  }, []);

  // The demo has its own made-up person and never looks at the real session.
  const value = demo ? DEMO_STATE : state;
  return <AuthContext value={value}>{children}</AuthContext>;
}

const DEMO_STATE: AuthState = {
  session: DEMO_SESSION as unknown as Session,
  isLoading: false,
};

export function useAuth(): AuthState {
  return use(AuthContext);
}

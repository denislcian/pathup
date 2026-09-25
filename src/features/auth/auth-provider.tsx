import type { Session } from '@supabase/supabase-js';
import {
  createContext,
  use,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

import { DEMO_SESSION, useDemoMode } from '@/lib/demo-mode';
import { supabase } from '@/lib/supabase';

type AuthState = {
  session: Session | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthState>({ session: null, isLoading: false });

const LOADING_STATE: AuthState = { session: null, isLoading: true };

const noSubscription = () => () => {};

/**
 * False while rendering the static HTML and while the browser hydrates it, true from then on (and
 * always on the phone). The demo flag lives in the browser, so until hydration ends nobody knows
 * whether this is the demo: reporting "signed out" in that gap made the guards redirect a demo
 * visitor who reloaded /ejercicios back to Today. It only showed without Supabase (as in CI),
 * because with Supabase the session is still loading at that point anyway.
 */
function useHydrated(): boolean {
  return useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const demo = useDemoMode();
  const hydrated = useHydrated();
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
  const value = demo ? DEMO_STATE : hydrated ? state : LOADING_STATE;
  return <AuthContext value={value}>{children}</AuthContext>;
}

const DEMO_STATE: AuthState = {
  session: DEMO_SESSION as unknown as Session,
  isLoading: false,
};

export function useAuth(): AuthState {
  return use(AuthContext);
}

import React from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/src/lib/supabase';

interface AuthContextValue {
  user: User | null;
  initializing: boolean;
  signUp: (email: string, password: string) => Promise<{ user: User; sessionActive: boolean }>;
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [initializing, setInitializing] = React.useState(true);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      setUser(data.session?.user ?? null);
      setInitializing(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setInitializing(false);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const signUp = React.useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error('Регистрация не удалась.');
    return { user: data.user, sessionActive: !!data.session };
  }, []);

  const signIn = React.useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  }, []);

  const signOut = React.useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const value = React.useMemo(
    () => ({ user, initializing, signUp, signIn, signOut }),
    [user, initializing, signUp, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- context + hook are colocated by design
export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

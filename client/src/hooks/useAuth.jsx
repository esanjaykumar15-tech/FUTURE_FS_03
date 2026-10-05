import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase.js';

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return undefined; }
    let active = true;
    supabase.auth.getSession().then(({ data }) => { if (active) { setSession(data.session); setLoading(false); } });
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);

  const signIn = useCallback(async (email, password) => {
    if (!supabase) throw new Error('Admin sign-in is not configured for this site.');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    // Deliberately generic: never reveal whether the email exists.
    if (error) throw new Error(error.status ? 'Incorrect email or password.' : 'Could not reach the sign-in service. Try again.');
  }, []);

  const signOut = useCallback(async () => { if (supabase) await supabase.auth.signOut(); setSession(null); }, []);

  const value = useMemo(() => ({ session, loading, signIn, signOut }), [session, loading, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

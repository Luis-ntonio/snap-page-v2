'use client';
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

export interface AuthProfile {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  role: 'cliente' | 'admin';
}

interface AuthCtx {
  user: AuthProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  loading: true,
  isAdmin: false,
  signIn: async () => ({ error: 'AuthProvider no inicializado' }),
  signOut: async () => {},
  refresh: async () => {},
});

// Cliente Supabase tolerante: si faltan las env vars, queda null y la app opera en modo anónimo/demo.
function safeClient(): SupabaseClient | null {
  try {
    return createClient();
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState<SupabaseClient | null>(() => safeClient());
  const [user, setUser] = useState<AuthProfile | null>(null);
  // loading arranca en true solo si hay cliente Supabase; si no, no hay nada que cargar.
  const [loading, setLoading] = useState(supabase !== null);

  const loadProfile = useCallback(async () => {
    if (!supabase) return; // sin cliente: estado inicial ya es { user:null, loading:false }
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) { setUser(null); setLoading(false); return; }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, nombre, email, telefono, role')
      .eq('id', authUser.id)
      .single();

    setUser(
      profile
        ? (profile as AuthProfile)
        : {
            id: authUser.id,
            nombre: (authUser.user_metadata?.nombre as string) ?? 'Usuario',
            email: authUser.email ?? undefined,
            role: 'cliente',
          },
    );
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return;
    // onAuthStateChange emite INITIAL_SESSION al suscribirse → cubre la carga inicial y los cambios.
    // El setState vive dentro de este callback (patrón aceptado), no en el cuerpo del efecto.
    const { data: sub } = supabase.auth.onAuthStateChange(() => { loadProfile(); });
    return () => sub.subscription.unsubscribe();
  }, [supabase, loadProfile]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!supabase) return { error: 'Supabase no configurado' };
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      await loadProfile();
      return {};
    },
    [supabase, loadProfile],
  );

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
  }, [supabase]);

  return (
    <AuthContext.Provider
      value={{ user, loading, isAdmin: user?.role === 'admin', signIn, signOut, refresh: loadProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

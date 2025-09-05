// src/shared/hooks/use-auth.ts
'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type Me = { authenticated: boolean; user?: any };

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store', credentials: 'include' });
      const json = (await res.json()) as Me;
      setUser(json.authenticated ? json.user : null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const isAuthenticated = !!user;
  const logout = async () => {
    // bata numa rota /api/auth/logout que zera cookies no server
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
  };

  return { user, loading, isAuthenticated, refresh, logout };
}

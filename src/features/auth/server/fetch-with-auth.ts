import 'server-only';
import { getAccessToken } from './cookies';

async function tryRefresh(): Promise<boolean> {
  const origin = process.env.NEXT_PUBLIC_APP_ORIGIN ?? 'http://localhost:3000';
  const res = await fetch(`${origin}/api/v1/auth/refresh`, { method: 'POST', cache: 'no-store' });
  return res.ok;
}

export async function fetchWithAuth(input: string, init: RequestInit = {}) {
  const token = getAccessToken();
  const res = await fetch(input, {
    ...init,
    headers: { ...(init.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    cache: 'no-store',
  });

  if (res.status !== 401) return res;

  const refreshed = await tryRefresh();
  if (!refreshed) return res;

  const newToken = getAccessToken();
  return fetch(input, {
    ...init,
    headers: { ...(init.headers || {}), ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}) },
    cache: 'no-store',
  });
}

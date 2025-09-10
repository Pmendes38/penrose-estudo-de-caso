import 'server-only';
import { getAccessToken } from './cookies';

async function tryRefreshInternal(): Promise<boolean> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4001'}/api/auth/refresh`, {
    method: 'POST',
    cache: 'no-store',
  });
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

  const refreshed = await tryRefreshInternal();
  if (!refreshed) return res;

  const newToken = getAccessToken();
  return fetch(input, {
    ...init,
    headers: { ...(init.headers || {}), ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}) },
    cache: 'no-store',
  });
}

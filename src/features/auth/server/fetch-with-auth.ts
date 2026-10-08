import 'server-only';
import { backendFetch as fetch } from '@/shared/lib/backend-fetch';
import { cookies } from 'next/headers';
import { getAccessToken, setAuthCookies } from './cookies';

function apiBase() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4001').replace(/\/+$/, '');
}

async function tryRefreshInternal(): Promise<boolean> {
  const res = await fetch(`${apiBase()}/api/v1/auth/refresh`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      cookie: cookies().toString(),
    },
  });

  if (!res.ok) return false;

  try {
    const data = await res.json().catch(() => null);
    if (data?.accessToken) {
      await setAuthCookies(data.accessToken, data.role ?? 'customer', {
        refreshToken: data.refreshToken,
      });
    }
  } catch {
  }

  return true;
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

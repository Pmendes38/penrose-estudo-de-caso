import { envClient } from '@/shared/lib/env.client';

export type ApiInit = RequestInit & { timeoutMs?: number; expectJson?: boolean };

export async function apiFetch(input: string, init: ApiInit = {}): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), init.timeoutMs ?? 15_000);

  try {
    const url = input.startsWith('http') ? input : `${envClient.NEXT_PUBLIC_API_BASE_URL}${input}`;
    const request = typeof window === 'undefined' ? (await import('@/shared/lib/backend-fetch')).backendFetch : fetch;
    const target = typeof window !== 'undefined' && url.startsWith(envClient.NEXT_PUBLIC_API_BASE_URL) ? url.slice(envClient.NEXT_PUBLIC_API_BASE_URL.length) : url;
    const res = await request(target, {
      ...init,
      cache: init?.cache ?? 'no-store', 
      credentials: init.credentials ?? 'include',
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export async function api<T = unknown>(input: string, init: ApiInit = {}): Promise<T> {
  const res = await apiFetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });

  if (!res.ok) {
    let msg: string | undefined;
    try { msg = (await res.json())?.message; } catch { try { msg = await res.text(); } catch {} }
    throw new Error(msg || `${res.status} ${res.statusText}`);
  }

  if (init.expectJson === false) {
    return undefined as T;
  }

  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    throw new Error('Resposta não é JSON');
  }
  return res.json() as Promise<T>;
}

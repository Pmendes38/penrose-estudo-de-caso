import 'server-only';
import { backendFetch as fetch } from '@/shared/lib/backend-fetch';
import { envServer } from '@/shared/lib/env.server';
import { setAuthCookies, clearAuthCookies, getAccessToken, getRefreshToken, getUserRole } from '../server/cookies';
import {
  AuthResultSchema,
  RefreshResponseSchema,
  LogoutResponseSchema,
  MeEnvelopeSchema,
  JwtPayloadSchema,
  type AuthResult,
  type RefreshResponse,
} from '../schemas';
import { fetchWithAuth } from '../server/fetch-with-auth';

const BASE = `${envServer.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth`;

export async function login(email: string, password: string): Promise<AuthResult> {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    let msg = 'Falha na autenticação';
    try { msg = (await res.json())?.message ?? msg; } catch {}
    throw new Error(msg);
  }
  const data = AuthResultSchema.parse(await res.json());
  setAuthCookies(data.tokens.accessToken, data.role, { refreshToken: data.tokens.refreshToken });
  return data;
}

export async function adminLogin(email: string, password: string): Promise<AuthResult> {
  const res = await fetch(`${BASE}/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    let msg = 'Falha na autenticação';
    try { msg = (await res.json())?.message ?? msg; } catch {}
    throw new Error(msg);
  }
  const data = AuthResultSchema.parse(await res.json());
  setAuthCookies(data.tokens.accessToken, data.role, { refreshToken: data.tokens.refreshToken });
  return data;
}

export async function register(payload: { name: string; email: string; password: string; phone?: string }) {
  const res = await fetch(`${BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({ ...payload, acceptTerms: true }),
  });
  if (!res.ok) {
    let msg = 'Falha no registro';
    try { msg = (await res.json())?.message ?? msg; } catch {}
    throw new Error(msg);
  }
  return true;
}

export async function refresh(): Promise<RefreshResponse> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('Missing refresh token');

  const res = await fetch(`${BASE}/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Refresh-Token': refreshToken },
    cache: 'no-store',
    body: JSON.stringify({}),
  });
  if (!res.ok) {
    let msg = 'Refresh failed';
    try { msg = (await res.json())?.message ?? msg; } catch {}
    throw new Error(msg);
  }
  const data = RefreshResponseSchema.parse(await res.json());
  const role = getUserRole() ?? 'customer';
  setAuthCookies(data.accessToken, role, { refreshToken: data.refreshToken });
  return data;
}

export async function logout({ all = false }: { all?: boolean } = {}) {
  const token = getAccessToken();
  const refreshToken = getRefreshToken();

  if (!token && !refreshToken) {
    clearAuthCookies();
    return { ok: true };
  }

  const res = await fetchWithAuth(`${BASE}/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(refreshToken ? { 'X-Refresh-Token': refreshToken } : {}) },
    cache: 'no-store',
    body: JSON.stringify({ all }),
  });

  clearAuthCookies();

  if (!res.ok) {
    return { ok: false, message: 'Falha ao encerrar sessão no servidor' };
  }
  const data = LogoutResponseSchema.safeParse(await res.json());
  return data.success ? data.data : { ok: true };
}

export async function me(): Promise<{ user: import('../schemas').JwtPayload } | null> {
  const res = await fetchWithAuth(`${BASE}/me`, { cache: 'no-store' });
  if (res.status === 401) return null;
  if (!res.ok) return null;

  const raw = await res.json().catch(() => null);
  if (!raw) return null;

  if ('user' in raw) {
    const env = MeEnvelopeSchema.safeParse(raw);
    return env.success ? env.data : null;
  }
  const single = JwtPayloadSchema.safeParse(raw);
  if (single.success) return { user: single.data };
  return null;
}

export async function adminPing(): Promise<boolean> {
  const res = await fetchWithAuth(`${BASE}/admin/ping`, { cache: 'no-store' });
  return res.ok;
}

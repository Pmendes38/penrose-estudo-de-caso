import 'server-only';
import { cookies } from 'next/headers';
import type { UserRole } from '../schemas';
import { envServer } from '@/shared/lib/env.server';

const base = {
  httpOnly: true,
  secure: envServer.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  ...(envServer.COOKIE_DOMAIN ? { domain: envServer.COOKIE_DOMAIN } : {}),
};

export function setAuthCookies(
  accessToken: string,
  role: UserRole,
  opts?: { refreshToken?: string; accessMaxAgeSec?: number; refreshMaxAgeSec?: number }
) {
  const jar = cookies();

  const accessMaxAge = opts?.accessMaxAgeSec ?? 60 * 60 * 2;     // 2h
  const refreshMaxAge = opts?.refreshMaxAgeSec ?? 60 * 60 * 24 * 30; // 30d

  jar.set('accessToken', accessToken, { ...base, maxAge: accessMaxAge });
  jar.set('role', role, { ...base, maxAge: accessMaxAge });

  if (opts?.refreshToken) {
    jar.set('refreshToken', opts.refreshToken, { ...base, maxAge: refreshMaxAge });
  }
}

export function clearAuthCookies() {
  const jar = cookies();
  const expired = { ...base, expires: new Date(0) };
  for (const name of ['accessToken', 'refreshToken', 'role']) {
    try { jar.set(name, '', expired); } catch {}
    try { jar.delete?.(name); } catch {}
  }
}

export function getAccessToken() {
  return cookies().get('accessToken')?.value ?? null;
}
export function getRefreshToken() {
  return cookies().get('refreshToken')?.value ?? null;
}
export function getUserRole(): UserRole | null {
  const v = cookies().get('role')?.value;
  return v === 'admin' ? 'admin' : v === 'customer' ? 'customer' : null;
}

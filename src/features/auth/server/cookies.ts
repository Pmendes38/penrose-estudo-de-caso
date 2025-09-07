import 'server-only';
import { cookies } from 'next/headers';
import { envServer } from '@/shared/lib/env.server';
import type { UserRole } from './schemas';

const base = {
  httpOnly: true,
  secure: envServer.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  ...(envServer.COOKIE_DOMAIN ? { domain: envServer.COOKIE_DOMAIN } : {}),
};

export function setAuthCookies(accessToken: string, role: UserRole, opts?: { expires?: Date; refreshToken?: string }) {
  const jar = cookies();
  const common = { ...base, ...(opts?.expires ? { expires: opts.expires } : { maxAge: 60 * 60 * 2 }) }; // 2h

  jar.set('accessToken', accessToken, common);
  jar.set('role', role, common);

  if (opts?.refreshToken) {
    jar.set('refreshToken', opts.refreshToken, { ...common, maxAge: 60 * 60 * 24 * 30 }); // 30d
  }
}

export function clearAuthCookies() {
  const jar = cookies();
  const expired = { ...base, expires: new Date(0) };
  for (const n of ['accessToken','refreshToken','role']) {
    try { jar.set(n, '', expired); } catch {}
    try { jar.delete?.(n); } catch {}
  }
}

export function getAccessToken() {
  return cookies().get('accessToken')?.value ?? null;
}
export function getUserRole(): UserRole | null {
  const v = cookies().get('role')?.value;
  return v === 'admin' ? 'admin' : v === 'customer' ? 'customer' : null;
}

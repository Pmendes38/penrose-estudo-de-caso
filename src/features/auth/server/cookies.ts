import 'server-only';
import { cookies } from 'next/headers';
import { envServer } from '@/shared/lib/env.server';

export type UserRole = 'admin' | 'customer';

const cookieBase = {
  httpOnly: true,
  secure: envServer.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  ...(envServer.COOKIE_DOMAIN ? { domain: envServer.COOKIE_DOMAIN } : {}),
};

export function getAccessToken() {
  return cookies().get('accessToken')?.value ?? null;
}

export function getUserRole(): UserRole | null {
  const v = cookies().get('role')?.value;
  return v === 'admin' ? 'admin' : v === 'customer' || v === 'cliente' ? 'customer' : null;
}

export const isAdmin = () => getUserRole() === 'admin';
export const isCustomer = () => getUserRole() === 'customer';

export function setAuthCookies(accessToken: string, role: UserRole, expires?: Date) {
  const jar = cookies();
  const opts = {
    ...cookieBase,
    ...(expires ? { expires } : { maxAge: 60 * 60 * 2 }), // 2h
  };
  jar.set('accessToken', accessToken, opts);
  jar.set('role', role, opts);
}

export function clearAuthCookies() {
  const jar = cookies();
  const expired = { ...cookieBase, expires: new Date(0) };

  for (const name of ['accessToken', 'refreshToken', 'role']) {
    try { jar.set(name, '', expired); } catch {}
    try { jar.delete?.(name); } catch {}
  }
}

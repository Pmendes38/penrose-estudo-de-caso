import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export type UserRole = 'admin' | 'customer';

type Jwt = {
  sub: string;
  role: UserRole;
  iat: number;
  exp: number;
};

export function getAccessToken(): string | null {
  return cookies().get('accessToken')?.value ?? null;
}

function b64urlToUtf8(input: string): string {
  let s = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = s.length % 4;
  if (pad) s += '='.repeat(4 - pad);
  // Node: Buffer; Edge: atob/TextDecoder
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(s, 'base64').toString('utf-8');
  }
  if (typeof atob === 'function') {
    const bin = atob(s);
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
    return new TextDecoder('utf-8').decode(bytes);
  }
  throw new Error('Base64 decoder unavailable in this runtime');
}

export function readJwtFromCookie(): Jwt | null {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payloadJson = b64urlToUtf8(parts[1]);
    const payload = JSON.parse(payloadJson) as Partial<Jwt>;
    if (!payload || !payload.role || !payload.exp) return null;
    if (Date.now() / 1000 >= Number(payload.exp)) return null;
    return payload as Jwt;
  } catch {
    return null;
  }
}

export function getUserRole(): UserRole | null {
  return readJwtFromCookie()?.role ?? null;
}

export function isAdmin() {
  return getUserRole() === 'admin';
}
export function isCustomer() {
  return getUserRole() === 'customer';
}

export function requireCustomerOrRedirect() {
  const user = readJwtFromCookie();
  if (!user) redirect('/login');
  if (user.role !== 'customer') redirect(user.role === 'admin' ? '/admin' : '/login');
  return user;
}

export function requireAdminOrRedirect() {
  const user = readJwtFromCookie();
  if (!user) redirect('/login');
  if (user.role !== 'admin') redirect('/');
  return user;
}

export function requireAuthOrRedirect(to: string = '/login') {
  const user = readJwtFromCookie();
  if (!user) redirect(to);
  return user;
}

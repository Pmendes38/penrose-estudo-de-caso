'use server';

import { cookies } from 'next/headers';

type AdminLoginPayload = { email: string; password: string };

export async function adminLoginAction(formData: AdminLoginPayload) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
    cache: 'no-store',
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.message ?? 'Authentication failed');
  }
  const data = await res.json();
  cookies().set('accessToken', data.tokens.accessToken, { httpOnly: true, secure: true, sameSite: 'lax', path: '/' });
  cookies().set('role', 'admin', { httpOnly: true, secure: true, sameSite: 'lax', path: '/' });
  return { ok: true };
}

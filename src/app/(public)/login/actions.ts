// app/(public)/login/actions.ts
'use server';

import { cookies } from 'next/headers';

type LoginPayload = { email: string; password: string };

export async function publicLoginAction(formData: LoginPayload) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
    cache: 'no-store',
  });

  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.message ?? 'Falha na autenticação');
  }

  const data = await res.json();
  cookies().set('accessToken', data.token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
  });
  cookies().set('role', data.role === 'admin' ? 'admin' : 'customer', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
  });

  return { ok: true, role: data.role };
}

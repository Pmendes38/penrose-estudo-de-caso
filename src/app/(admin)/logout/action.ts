'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function adminLogoutAction() {
  const jar = cookies();
  const base = { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const };
  jar.set('accessToken', '', { ...base, maxAge: 0 });
  jar.set('role', '', { ...base, maxAge: 0 });

  redirect('/login');
}

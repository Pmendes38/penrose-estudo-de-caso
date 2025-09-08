import { NextResponse } from 'next/server';
import { envServer } from '@/shared/lib/env.server';
import { cookies } from 'next/headers';
import { setAuthCookies, getUserRole } from '@/features/auth/server/cookies';

export async function POST() {
  const jar = cookies();
  const refreshToken = jar.get('refreshToken')?.value;
  if (!refreshToken) {
    return NextResponse.json({ ok: false, message: 'Missing refresh token' }, { status: 401 });
  }

  const res = await fetch(`${envServer.AUTH_API_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Refresh-Token': refreshToken },
    cache: 'no-store',
    body: JSON.stringify({}), // usando header
  });

  if (!res.ok) {
    return NextResponse.json({ ok: false, message: 'Refresh failed' }, { status: 401 });
  }

  const { accessToken, refreshToken: newRefresh } = await res.json();
  const role = getUserRole() ?? 'customer';
  setAuthCookies(accessToken, role, { refreshToken: newRefresh });

  return NextResponse.json({ ok: true }, { status: 200 });
}

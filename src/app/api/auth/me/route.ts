import { NextResponse } from 'next/server';
import { getAccessToken } from '@/features/auth/server/cookies';
import { envServer } from '@/shared/lib/env.server';

export async function GET() {
  const token = getAccessToken();
  if (!token) return NextResponse.json({ authenticated: false }, { status: 200 });

  const res = await fetch(`${envServer.AUTH_API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
  const user = await res.json();
  return NextResponse.json({ authenticated: true, user });
}
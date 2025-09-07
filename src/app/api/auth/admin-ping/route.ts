import { NextResponse } from 'next/server';
import { envServer } from '@/shared/lib/env.server';
import { getAccessToken } from '@/features/auth/server/cookies';

export async function GET() {
  const token = getAccessToken();
  if (!token) return NextResponse.json({ ok:false }, { status: 200 });

  const res = await fetch(`${envServer.AUTH_API_URL}/api/auth/admin/ping`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  return NextResponse.json({ ok: res.ok }, { status: 200 });
}

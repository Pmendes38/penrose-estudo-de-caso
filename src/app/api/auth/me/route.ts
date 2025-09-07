import { NextResponse } from 'next/server';
import { envServer } from '@/shared/lib/env.server';
import { getAccessToken } from '@/features/auth/server/cookies';
import { JwtPayloadSchema } from '@/features/auth/server/schemas';

export async function GET() {
  const token = getAccessToken();
  if (!token) return NextResponse.json({ authenticated: false }, { status: 200 });

  const res = await fetch(`${envServer.AUTH_API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok) return NextResponse.json({ authenticated:false }, { status: 200 });

  const raw = await res.json();           // backend responde { user: payload }
  const user = JwtPayloadSchema.parse(raw.user);
  return NextResponse.json({ authenticated: true, user }, { status: 200 });
}

// src/app/api/v1/payments/route.ts
import { NextResponse } from 'next/server';
import { fetchWithAuth } from '@/features/auth/server/fetch-with-auth';
import { envServer } from '@/shared/lib/env.server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.text(); // passa direto (JSON)
  const res = await fetchWithAuth(`${envServer.NEXT_PUBLIC_API_BASE_URL}/api/v1/payments`, {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type':'application/json' },
    body,
  });
  const text = await res.text();
  return new NextResponse(text, { status: res.status, headers: { 'content-type':'application/json' } });
}

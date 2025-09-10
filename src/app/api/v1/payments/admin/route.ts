// src/app/api/v1/payments/admin/route.ts
import { NextResponse } from 'next/server';
import { fetchWithAuth } from '@/features/auth/server/fetch-with-auth';
import { envServer } from '@/shared/lib/env.server';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const res = await fetchWithAuth(`${envServer.NEXT_PUBLIC_API_BASE_URL}/api/v1/payments/admin?${url.searchParams}`, { cache:'no-store' });
  const text = await res.text();
  return new NextResponse(text, { status: res.status, headers: { 'content-type':'application/json' } });
}

// src/app/api/v1/payments/tokenize/route.ts
import { NextResponse } from 'next/server';
import { backendFetch as fetch } from '@/shared/lib/backend-fetch';
import { envServer } from '@/shared/lib/env.server';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const gw = await fetch(`${envServer.NEXT_PUBLIC_API_BASE_URL}/api/v1/payments/tokenize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.PAYMENTS_SECRET ?? ''}`,
      },
      body,
      cache: 'no-store',
    });
    const text = await gw.text();
    return new NextResponse(text, { status: gw.status, headers: { 'content-type':'application/json' } });
  } catch (e:any) {
    return NextResponse.json({ message: e?.message || 'Erro interno' }, { status: 500 });
  }
}

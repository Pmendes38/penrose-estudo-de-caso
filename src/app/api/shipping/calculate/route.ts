import { NextResponse } from 'next/server';
import { envServer } from '@/shared/lib/env.server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const res = await fetch(`${envServer.AUTH_API_URL}/api/shipping/calculate`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      cache: 'no-store',
      body: JSON.stringify(body),
    });
    const text = await res.text();
    return new NextResponse(text, { status: res.status, headers: { 'content-type': 'application/json' } });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Erro ao calcular frete' }, { status: 500 });
  }
}

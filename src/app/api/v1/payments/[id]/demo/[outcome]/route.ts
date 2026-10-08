import { NextResponse } from 'next/server';
import { fetchWithAuth } from '@/features/auth/server/fetch-with-auth';
import { envServer } from '@/shared/lib/env.server';

export async function PUT(_: Request, { params }: { params: { id: string; outcome: string } }) {
  if (!['approve', 'decline'].includes(params.outcome)) return NextResponse.json({ message: 'Resultado inválido' }, { status: 400 });
  const res = await fetchWithAuth(`${envServer.NEXT_PUBLIC_API_BASE_URL}/api/v1/payments/${encodeURIComponent(params.id)}/demo/${params.outcome}`, { method: 'PUT' });
  return new NextResponse(await res.text(), { status: res.status, headers: { 'content-type': 'application/json' } });
}

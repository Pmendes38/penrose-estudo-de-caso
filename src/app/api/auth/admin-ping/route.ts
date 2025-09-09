import { NextResponse } from 'next/server';
import { adminPing } from '@/features/auth/api';

export async function GET() {
  const ok = await adminPing().catch(() => false);
  return NextResponse.json({ ok }, { status: 200 });
}

import { NextResponse } from 'next/server';
import { refresh } from '@/features/auth/api';

export async function POST() {
  try {
    await refresh();
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false, message: 'Refresh failed' }, { status: 401 });
  }
}

import { NextResponse } from 'next/server';
import { me } from '@/features/auth/api';

export async function GET() {
  const data = await me();
  if (!data) return NextResponse.json({ authenticated: false }, { status: 200 });
  return NextResponse.json({ authenticated: true, ...data }, { status: 200 });
}

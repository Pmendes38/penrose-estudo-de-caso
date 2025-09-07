// src/app/api/coupons/validate/route.ts
import { NextResponse } from 'next/server';
import { listAvailableCoupons } from '@/features/coupons/api/api';

export async function POST(req: Request) {
  const { code } = await req.json().catch(() => ({}));
  if (!code) return NextResponse.json({ message: 'Código é obrigatório' }, { status: 400 });

  const coupons = await listAvailableCoupons();
  const c = coupons.find(x => x.code === String(code).trim().toUpperCase());
  if (!c) return NextResponse.json({ message: 'Cupom inválido ou expirado' }, { status: 404 });

  const now = new Date();
  if (!c.active || c.startsAt > now || c.endsAt < now) {
    return NextResponse.json({ message: 'Cupom fora do período ativo' }, { status: 400 });
  }

  return NextResponse.json({ coupon: c }, { status: 200 });
}

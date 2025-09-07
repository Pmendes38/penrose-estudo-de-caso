import { NextResponse } from 'next/server';
import { getPayment } from '@/features/payments/api/api';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const payment = await getPayment(params.id);
    return NextResponse.json(payment, { status: 200 });
  } catch (e:any) {
    return NextResponse.json({ message: e?.message ?? 'Erro' }, { status: 400 });
  }
}

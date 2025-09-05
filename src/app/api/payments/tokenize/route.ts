import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const gatewayRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/tokenize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.PAYMENTS_SECRET}`,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!gatewayRes.ok) {
      const err = await gatewayRes.json().catch(() => ({}));
      return NextResponse.json({ message: err?.message || 'Falha ao tokenizar' }, { status: 400 });
    }

    const { token } = await gatewayRes.json();
    return NextResponse.json({ token });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Erro interno' }, { status: 500 });
  }
}

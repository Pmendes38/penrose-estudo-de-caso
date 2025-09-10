import { NextRequest } from 'next/server';
import { proxyCart } from '../../_lib/cart-proxy';

export async function DELETE(req: NextRequest, { params }: { params: { code: string } }) {
  return proxyCart(req, `/coupons/${encodeURIComponent(params.code)}`, { method: 'DELETE' });
}

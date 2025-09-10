import { NextRequest } from 'next/server';
import { proxyCart } from '../../_lib/cart-proxy';

export async function PATCH(req: NextRequest, { params }: { params: { itemId: string } }) {
  return proxyCart(req, `/items/${encodeURIComponent(params.itemId)}`, { method: 'PATCH' });
}

export async function DELETE(req: NextRequest, { params }: { params: { itemId: string } }) {
  return proxyCart(req, `/items/${encodeURIComponent(params.itemId)}`, { method: 'DELETE' });
}

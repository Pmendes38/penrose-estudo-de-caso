import { NextRequest } from 'next/server';
import { proxyCart } from '../../_lib/cart-proxy';

export async function POST(req: NextRequest) {
  return proxyCart(req, '/shipping/select', { method: 'POST' });
}

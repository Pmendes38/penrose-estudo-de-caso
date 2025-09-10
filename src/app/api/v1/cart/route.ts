import { NextRequest } from 'next/server';
import { proxyCart } from './_lib/cart-proxy';

export async function GET(req: NextRequest) {
  return proxyCart(req, '', { method: 'GET' });
}

export async function POST(req: NextRequest) {
  return proxyCart(req, '', { method: 'POST' });
}

// src/app/api/v1/shipping/validate-postal-code/route.ts
export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { proxyShipping } from '../_lib/shipping-proxy';
export async function POST(req: NextRequest) {
  return proxyShipping(req, '/validate-postal-code', { method: 'POST' });
}

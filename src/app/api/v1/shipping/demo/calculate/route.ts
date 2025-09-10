// src/app/api/v1/shipping/demo/calculate/route.ts
import { NextRequest } from 'next/server';
import { proxyShipping } from '../../_lib/shipping-proxy';
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const qp = url.search ? `?${url.searchParams.toString()}` : '';
  return proxyShipping(req, `/demo/calculate${qp}`, { method: 'GET' });
}

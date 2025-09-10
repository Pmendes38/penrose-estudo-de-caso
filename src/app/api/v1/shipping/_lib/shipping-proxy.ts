// src/app/api/v1/shipping/_lib/shipping-proxy.ts
import { NextRequest, NextResponse } from 'next/server';
import { envServer } from '@/shared/lib/env.server';

const BASE = envServer.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, '');
const SHIPPING_BASE = `${BASE}/api/v1/shipping`;

export async function proxyShipping(req: NextRequest, backendPath: string, init?: RequestInit) {
  const url = `${SHIPPING_BASE}${backendPath}`;
  const headers: Record<string, string> = { Accept: 'application/json' };

  const auth = req.headers.get('authorization');
  if (auth) headers['authorization'] = auth;

  let body: BodyInit | undefined;
  if (init?.body !== undefined) body = init.body;
  else if (req.method !== 'GET' && req.method !== 'HEAD') {
    const ct = req.headers.get('content-type') ?? '';
    if (ct.includes('application/json')) {
      const json = await req.json().catch(() => undefined);
      if (json !== undefined) { headers['Content-Type'] = 'application/json'; body = JSON.stringify(json); }
    } else {
      const buf = await req.arrayBuffer(); body = buf as any; if (ct) headers['Content-Type'] = ct;
    }
  }

  const be = await fetch(url, { method: init?.method ?? req.method, headers, body, cache: 'no-store' });
  let payload: any = null; try { payload = await be.json(); } catch {}
  return NextResponse.json(payload, { status: be.status });
}

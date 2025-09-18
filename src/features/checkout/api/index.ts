import { cookies } from 'next/headers';
import { envServer } from '@/shared/lib/env.server';
import {
  PrepareCheckoutResponseSchema,
  PlaceOrderInputSchema,
  PlaceOrderResponseSchema,
  type PrepareCheckoutResponse,
  type PlaceOrderInput,
  type PlaceOrderResponse,
} from '../schemas';

const BASE = `${envServer.NEXT_PUBLIC_API_BASE_URL}/api/v1/checkout`;

async function sha256Base64url(input: string): Promise<string> {
  // Node/Edge compat
  const cryptoAny = globalThis.crypto as any;
  if (cryptoAny?.subtle?.digest) {
    const enc = new TextEncoder();
    const buf = await cryptoAny.subtle.digest('SHA-256', enc.encode(input));
    const bytes = new Uint8Array(buf);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return Buffer.from(bin, 'binary').toString('base64url');
  }
  const { createHash } = await import('crypto');
  return createHash('sha256').update(input).digest('base64url');
}

export async function buildIdempotencyKey(kind: string, body?: unknown) {
  const payload = JSON.stringify({ kind, body });
  const h = await sha256Base64url(payload);
  return `${kind}:${h}`.slice(0, 200);
}

async function apiFetch<T>(path: string, init: RequestInit & { idempotencyKey?: string } = {}): Promise<T> {
  const hdrs: Record<string, string> = {
    Accept: 'application/json',
    ...(init.headers as Record<string, string>),
    cookie: cookies().toString(), // encaminha cartId/session
  };
  if (init.idempotencyKey) hdrs['Idempotency-Key'] = init.idempotencyKey;
  const res = await fetch(`${BASE}${path}`, { ...init, headers: hdrs, cache: 'no-store' });

  let json: any = null;
  try { json = await res.json(); } catch { /* ignore */ }

  if (!res.ok) {
    const msg = json?.message || json?.error || `HTTP ${res.status}`;
    const err: any = new Error(msg);
    err.status = res.status;
    err.payload = json;
    throw err;
  }
  return json as T;
}

/** POST /checkout/prepare */
export async function prepareCheckoutDraft(opts?: { idempotencyKey?: string }): Promise<PrepareCheckoutResponse> {
  const idem = opts?.idempotencyKey ?? await buildIdempotencyKey('checkout:prepare', { at: Date.now() });
  const data = await apiFetch<unknown>('/prepare', { method: 'POST', idempotencyKey: idem });
  return PrepareCheckoutResponseSchema.parse(data);
}

/** GET /checkout/drafts/:id */
export async function getCheckoutDraft(draftId: string) {
  return apiFetch(`/drafts/${encodeURIComponent(draftId)}`, { method: 'GET' });
}

/** POST /checkout/place */
export async function placeCheckout(input: PlaceOrderInput, opts?: { idempotencyKey?: string }): Promise<PlaceOrderResponse> {
  const body = PlaceOrderInputSchema.parse(input);
  const idem = opts?.idempotencyKey ?? await buildIdempotencyKey('checkout:place', body);
  const data = await apiFetch<unknown>('/place', {
    method: 'POST',
    idempotencyKey: idem,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return PlaceOrderResponseSchema.parse(data);
}

/** DELETE /checkout/drafts (abandona todos os rascunhos do carrinho atual) */
export async function abandonAllDrafts(): Promise<void> {
  await apiFetch('/drafts', { method: 'DELETE' });
}

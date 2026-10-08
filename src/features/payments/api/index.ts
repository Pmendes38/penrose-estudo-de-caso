import { envServer } from '@/shared/lib/env.server';
import { fetchWithAuth } from '@/features/auth/server/fetch-with-auth';
import {
  PaymentSchema,
  PaginatedPaymentsSchema,
  CreatePaymentPayload,
  type Payment,
} from '../schemas';
import crypto from 'crypto';
import { cookies } from 'next/headers';

const API_BASE = (envServer.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/+$/, '');
const BASE = `${API_BASE}/api/v1/payments`;

function qs(params: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

async function parseOrThrow<T>(res: Response, schema: { parse: (x: unknown) => T }): Promise<T> {
  if (!res.ok) {
    let msg: string | undefined;
    try {
      const j = await res.json();
      msg = j?.message || j?.error || j?.errors?.[0]?.description;
    } catch {
      try { msg = await res.text(); } catch {}
    }
    throw new Error(msg || `${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  return schema.parse(json);
}

function stableJson(v: unknown): unknown {
  if (v === null || typeof v !== 'object') return v;
  if (Array.isArray(v)) return v.map(stableJson);
  const obj = v as Record<string, unknown>;
  return Object.fromEntries(Object.keys(obj).sort().map(k => [k, stableJson(obj[k])]));
}

function buildIdempotencyKey(payload: unknown) {
  const body = JSON.stringify(stableJson(payload));
  const digest = crypto.createHash('sha256').update(body).digest('base64url');
  return `pay:${digest}`.slice(0, 200);
}

export async function createPayment(input: CreatePaymentPayload): Promise<Payment> {
  const idempotencyKey = input.idempotencyKey ?? buildIdempotencyKey({ ...input, route: '/api/v1/payments' });
  const payload = { ...input, idempotencyKey };

  const res = await fetchWithAuth(`${BASE}`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Idempotency-Key': idempotencyKey,
      cookie: cookies().toString(),
    },
    body: JSON.stringify(payload),
  });

  return parseOrThrow(res, PaymentSchema);
}

export async function getPayment(id: string): Promise<Payment> {
  const res = await fetchWithAuth(`${BASE}/${encodeURIComponent(id)}`, {
    cache: 'no-store',
    headers: { 'Accept': 'application/json' },
  });
  return parseOrThrow(res, PaymentSchema);
}

export async function approveDemoPayment(id: string): Promise<Payment> {
  const res = await fetchWithAuth(`${BASE}/${encodeURIComponent(id)}/demo/approve`, { method: 'PUT', cache: 'no-store' });
  return parseOrThrow(res, PaymentSchema);
}

export type ListPaymentsAdminOpts = {
  page?: number;
  pageSize?: number;
  status?: 'PENDING' | 'AUTHORIZED' | 'CONFIRMED' | 'CANCELED' | 'REFUNDED' | 'FAILED';
  billingType?: 'PIX' | 'BOLETO' | 'CREDIT_CARD';
  orderId?: string;
  providerPaymentId?: string;
};

export async function listPaymentsAdmin(opts: ListPaymentsAdminOpts = {}) {
  const { page = 1, pageSize = 20, status, billingType, orderId, providerPaymentId } = opts;
  const res = await fetchWithAuth(
    `${BASE}/admin${qs({ page, pageSize, status, billingType, orderId, providerPaymentId })}`,
    { cache: 'no-store', headers: { 'Accept': 'application/json' } },
  );
  return parseOrThrow(res, PaginatedPaymentsSchema);
}

export async function cancelPaymentAdmin(id: string): Promise<void> {
  const res = await fetchWithAuth(`${BASE}/admin/${encodeURIComponent(id)}/cancel`, {
    method: 'PUT',
    cache: 'no-store',
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) {
    let msg: string | undefined;
    try { msg = (await res.json())?.message; } catch { try { msg = await res.text(); } catch {} }
    throw new Error(msg || `${res.status} ${res.statusText}`);
  }
}

export async function refundPaymentAdmin(id: string): Promise<void> {
  const res = await fetchWithAuth(`${BASE}/admin/${encodeURIComponent(id)}/refund`, {
    method: 'PUT',
    cache: 'no-store',
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) {
    let msg: string | undefined;
    try { msg = (await res.json())?.message; } catch { try { msg = await res.text(); } catch {} }
    throw new Error(msg || `${res.status} ${res.statusText}`);
  }
}

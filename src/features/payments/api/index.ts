import { envServer } from '@/shared/lib/env.server';
import { fetchWithAuth } from '@/features/auth/server/fetch-with-auth';
import {
  PaymentSchema,
  PaginatedPaymentsSchema,
  CreatePaymentPayload,
  type Payment,
} from '../schemas';

const BASE = `${envServer.NEXT_PUBLIC_API_BASE_URL}/api/v1/payments`;

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
    try { msg = (await res.json())?.message; } catch { try { msg = await res.text(); } catch {} }
    throw new Error(msg || `${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  return schema.parse(json);
}

export async function createPayment(input: CreatePaymentPayload): Promise<Payment> {
  let res = await fetchWithAuth(`${BASE}`, {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (res.status === 404) {
    res = await fetchWithAuth(`${BASE}/create`, {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  }

  return parseOrThrow(res, PaymentSchema);
}

export async function getPayment(id: string): Promise<Payment> {
  const res = await fetchWithAuth(`${BASE}/${id}`, { cache: 'no-store' });
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
    { cache: 'no-store' },
  );
  return parseOrThrow(res, PaginatedPaymentsSchema);
}

export async function cancelPaymentAdmin(id: string): Promise<void> {
  const res = await fetchWithAuth(`${BASE}/admin/${id}/cancel`, {
    method: 'PUT',
    cache: 'no-store',
  });
  if (!res.ok) {
    let msg: string | undefined;
    try { msg = (await res.json())?.message; } catch { try { msg = await res.text(); } catch {} }
    throw new Error(msg || `${res.status} ${res.statusText}`);
  }
}

export async function refundPaymentAdmin(id: string): Promise<void> {
  const res = await fetchWithAuth(`${BASE}/admin/${id}/refund`, {
    method: 'PUT',
    cache: 'no-store',
  });
  if (!res.ok) {
    let msg: string | undefined;
    try { msg = (await res.json())?.message; } catch { try { msg = await res.text(); } catch {} }
    throw new Error(msg || `${res.status} ${res.statusText}`);
  }
}

import 'server-only';
import { envServer } from '@/shared/lib/env.server';
import { fetchWithAuth } from '@/features/auth/server/fetch-with-auth';
import { z } from 'zod';
import { CouponSchema, CreateCouponPayload, UpdateCouponPayload, type Coupon } from '../schemas';

const CouponsArray = z.array(CouponSchema);

export async function listAdminCoupons(): Promise<Coupon[]> {
  const res = await fetchWithAuth(`${envServer.AUTH_API_URL}/api/coupons/admin`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return CouponsArray.parse(await res.json());
}

export async function createCoupon(payload: CreateCouponPayload): Promise<Coupon> {
  const res = await fetchWithAuth(`${envServer.AUTH_API_URL}/api/coupons/admin`, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    cache: 'no-store',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return CouponSchema.parse(await res.json());
}

export async function updateCoupon(id: string, payload: UpdateCouponPayload): Promise<Coupon> {
  const res = await fetchWithAuth(`${envServer.AUTH_API_URL}/api/coupons/admin/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type':'application/json' },
    cache: 'no-store',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return CouponSchema.parse(await res.json());
}

export async function deleteCoupon(id: string): Promise<{ message: string }> {
  const res = await fetchWithAuth(`${envServer.AUTH_API_URL}/api/coupons/admin/${id}`, {
    method: 'DELETE',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Público
export async function listAvailableCoupons(): Promise<Coupon[]> {
  const res = await fetch(`${envServer.AUTH_API_URL}/api/coupons/available`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Falha ao buscar cupons disponíveis');
  return CouponsArray.parse(await res.json());

}

export async function validateCoupon(input: {
  code: string;
  cartTotal?: number;
  items?: Array<{ productId: string; quantity: number; unitPrice: number; size?: string }>;
}): Promise<{ ok: true; coupon: Coupon; discountTotal: number }> {
  const res = await fetchWithAuth(`${envServer.AUTH_API_URL}/api/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    cache: 'no-store',
    body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || 'Cupom inválido');
  return json;
}

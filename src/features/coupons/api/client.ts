'use client';

export async function validateCoupon(input: {
  code: string;
  cartTotal?: number;
  items?: Array<{ productId: string; quantity: number; unitPrice: number; size?: string }>;
}) {
  const res = await fetch('/api/v1/coupons/validate', {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || 'Falha ao validar cupom');
  // espera-se algo como: { coupon, discountTotal }
  return json;
}

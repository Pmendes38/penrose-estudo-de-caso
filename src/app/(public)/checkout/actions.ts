'use server';

import { cookies } from 'next/headers';
import { z } from 'zod';

const CheckoutSession = z.object({
  customerData: z.record(z.string(), z.any()),
  selectedShipping: z.record(z.string(), z.any()).nullish(),
  couponCode: z.string().optional(),
});

export async function setCheckoutSessionAction(input: unknown) {
  const parsed = CheckoutSession.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos' };
  }
  cookies().set('checkout_session', JSON.stringify(parsed.data), {
    httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 2, // 2h
  });
  return { ok: true };
}

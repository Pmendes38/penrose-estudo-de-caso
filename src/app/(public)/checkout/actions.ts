'use server';

import { cookies } from 'next/headers';
import { z } from 'zod';
import { quoteShipping, selectShipping, applyCoupon, removeCoupon, getCart } from '@/features/cart/api';
import { prepareCheckoutDraft, buildIdempotencyKey } from '@/features/checkout/api';

const CheckoutSession = z.object({
  customerData: z.record(z.string(), z.any()),
  selectedShipping: z
    .object({ id: z.string() })
    .nullable()
    .optional(),
  couponCode: z.string().optional(),
});

function onlyDigits(v: string) { return String(v || '').replace(/\D/g, ''); }

export async function setCheckoutSessionAction(input: unknown) {
  const parsed = CheckoutSession.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos' };
  }

  const { customerData, selectedShipping, couponCode } = parsed.data;

  const cepDigits = onlyDigits(String(customerData?.cep || ''));
  if (!cepDigits || cepDigits.length !== 8) {
    return { ok: false, error: 'CEP inválido' };
  }
  if (!selectedShipping?.id) {
    return { ok: false, error: 'Selecione uma opção de frete' };
  }

  try {
    const opts = { cookie: cookies().toString() };
    const cart = await getCart(opts);
    for (const code of cart.coupons ?? []) if (code !== couponCode?.trim().toUpperCase()) await removeCoupon(code, opts);
    if (couponCode) await applyCoupon(couponCode, opts);
    await quoteShipping({ address: { ...customerData, postalCode: cepDigits } }, opts);

    await selectShipping(
      { serviceCode: selectedShipping.id, address: { postalCode: cepDigits } },
      { cookie: cookies().toString() },
    );
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Não foi possível selecionar o frete' };
  }

  let draftId: string;
  try {
    const prepared = await prepareCheckoutDraft({
      idempotencyKey: await buildIdempotencyKey('checkout:prepare', { at: Date.now() }),
    });
    draftId = prepared.draftId;
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Falha ao preparar checkout' };
  }

  cookies().set(
    'checkout_session',
    JSON.stringify({ customerData, couponCode, draftId }),
    { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 2 },
  );

  return { ok: true, draftId };
}

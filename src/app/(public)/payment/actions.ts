'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createPayment } from '@/features/payments/api/api';
import { CreatePaymentPayload, BillingType } from '@/features/payments/schemas';
import { getMe } from '@/features/auth/server/me';

const FormShape = z.object({
  billingType: BillingType,
  cartItems: z.string(),       // JSON string
  totalAmount: z.coerce.number(),
  customerData: z.string(),    // JSON string
  selectedShipping: z.string().optional().nullable(), // JSON string
  idempotencyKey: z.string().optional().nullable(),
});

export async function createPaymentAction(_: any, form: FormData) {
  const me = await getMe();
  if (!me || me.role !== 'customer') return { ok:false, error:'Faça login para pagar.' };

  const raw = {
    billingType: String(form.get('billingType') ?? ''),
    cartItems: String(form.get('cartItems') ?? '[]'),
    totalAmount: form.get('totalAmount'),
    customerData: String(form.get('customerData') ?? '{}'),
    selectedShipping: String(form.get('selectedShipping') ?? ''),
    idempotencyKey: String(form.get('idempotencyKey') ?? ''),
  };
  const parsed = FormShape.safeParse(raw);
  if (!parsed.success) return { ok:false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos' };

  let cartItems, customerData, selectedShipping;
  try { cartItems = JSON.parse(parsed.data.cartItems); } catch { return { ok:false, error:'Itens inválidos' }; }
  try { customerData = JSON.parse(parsed.data.customerData); } catch { return { ok:false, error:'Cliente inválido' }; }
  try { selectedShipping = parsed.data.selectedShipping ? JSON.parse(parsed.data.selectedShipping) : undefined; } catch {}

  const payload = CreatePaymentPayload.parse({
    cartItems,
    totalAmount: parsed.data.totalAmount,
    billingType: parsed.data.billingType,
    customerData,
    selectedShipping,
    idempotencyKey: parsed.data.idempotencyKey || undefined,
  });

  try {
    const payment = await createPayment(payload);

    if (payment.billingType === 'CREDIT_CARD' && payment.status === 'CONFIRMED') {
      revalidatePath('/thank-you');
      redirect(`/thank-you?order=${payment.orderId}`);
    }

    return { ok:true, paymentId: payment.id };
  } catch (e:any) {
    return { ok:false, error: e?.message ?? 'Falha ao criar pagamento' };
  }
}

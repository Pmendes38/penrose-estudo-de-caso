'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createPayment } from '@/features/payments/api';
import { CreatePaymentSchema, BillingType } from '@/features/payments/schemas';
import { getMe } from '@/features/auth/server/me';

/** Fallback seguro para idempotency quando o cliente não enviar */
function hashString(input: string) {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h) + input.charCodeAt(i);
  // limita tamanho final (headers/DB geralmente aceitam ~200 chars)
  return `cart:${(h >>> 0).toString(36)}`.slice(0, 200);
}

const FormShape = z.object({
  billingType: BillingType,
  cartItems: z.string(),       // JSON string
  totalAmount: z.coerce.number(),
  customerData: z.string(),    // JSON string
  selectedShipping: z.string().optional().nullable(), // JSON string
  idempotencyKey: z.string().optional().nullable(),
});

export async function createPaymentAction(_: unknown, form: FormData) {
  const me = await getMe();
  if (!me || me.role !== 'customer') {
    return { ok: false, error: 'Faça login para pagar.' };
  }

  // coleta valores crus do form
  const raw = {
    billingType: String(form.get('billingType') ?? ''),
    cartItems: String(form.get('cartItems') ?? '[]'),
    totalAmount: form.get('totalAmount'),
    customerData: String(form.get('customerData') ?? '{}'),
    selectedShipping: String(form.get('selectedShipping') ?? ''),
    idempotencyKey: String(form.get('idempotencyKey') ?? ''),
  };

  // valida shape básico
  const parsed = FormShape.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos' };
  }

  // parse de JSON dos campos complexos
  let cartItems: unknown, customerData: unknown, selectedShipping: unknown | undefined;
  try {
    cartItems = JSON.parse(parsed.data.cartItems);
  } catch {
    return { ok: false, error: 'Itens inválidos' };
  }
  try {
    customerData = JSON.parse(parsed.data.customerData);
  } catch {
    return { ok: false, error: 'Cliente inválido' };
  }
  try {
    selectedShipping = parsed.data.selectedShipping
      ? JSON.parse(parsed.data.selectedShipping)
      : undefined;
  } catch {
    // se o JSON do frete vier quebrado, apenas ignore e deixe o backend validar
    selectedShipping = undefined;
  }

  // idempotency: usa o do cliente ou gera um determinístico no server
  const idem =
    (parsed.data.idempotencyKey || '').trim() ||
    hashString(
      JSON.stringify({
        billingType: parsed.data.billingType,
        totalAmount: parsed.data.totalAmount,
        cartItems,
        selectedShipping,
      }),
    );

  // valida o payload completo contra o schema de domínio
  const payload = CreatePaymentSchema.parse({
    cartItems,
    totalAmount: Math.max(0, parsed.data.totalAmount), // clamp defensivo
    billingType: parsed.data.billingType,
    customerData,
    selectedShipping,
    idempotencyKey: idem,
  });

  try {
    const payment = await createPayment(payload);

    // fluxo cartão: se já confirmado, vai direto pro obrigado
    if (payment.billingType === 'CREDIT_CARD' && payment.status === 'CONFIRMED') {
      revalidatePath('/thank-you');
      redirect(`/thank-you?order=${payment.orderId}`);
    }

    // para PIX/BOLETO (ou cartão pendente), devolve o id para a tela de "aguarde"
    return { ok: true, paymentId: payment.id };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Falha ao criar pagamento' };
  }
}

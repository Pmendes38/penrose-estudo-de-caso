'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createOrder } from '@/features/orders/api/api';
import { CreateOrderPayload } from '@/features/orders/schemas';
import { getMe } from '@/features/auth/server/me'; // você já tem esse helper
import { redirect } from 'next/navigation';

const CreateOrderForm = z.object({
  items: z.string(), // JSON string vindo do client
  subtotal: z.number(),
  shippingTotal: z.number(),
  discountTotal: z.number(),
  grandTotal: z.number(),
  couponCode: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function createOrderAction(_: any, form: FormData) {
  // garante usuário logado
  const me = await getMe();
  if (!me || me.role !== 'customer') return { ok:false, error:'Faça login para finalizar a compra' };

  const raw = {
    items: String(form.get('items') ?? '[]'),
    subtotal: Number(form.get('subtotal') ?? 0),
    shippingTotal: Number(form.get('shippingTotal') ?? 0),
    discountTotal: Number(form.get('discountTotal') ?? 0),
    grandTotal: Number(form.get('grandTotal') ?? 0),
    couponCode: String(form.get('couponCode') ?? '') || undefined,
    notes: String(form.get('notes') ?? '') || undefined,
  };
  const parsed = CreateOrderForm.safeParse(raw);
  if (!parsed.success) return { ok:false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos' };

  let items;
  try { items = JSON.parse(parsed.data.items); } catch { return { ok:false, error:'Itens inválidos' }; }

  const payload = CreateOrderPayload.parse({
    customerId: me.id,
    items,
    subtotal: parsed.data.subtotal,
    shippingTotal: parsed.data.shippingTotal,
    discountTotal: parsed.data.discountTotal,
    grandTotal: parsed.data.grandTotal,
    couponCode: parsed.data.couponCode ?? undefined,
    notes: parsed.data.notes ?? undefined,
  });

  try {
    const order = await createOrder(payload);
    revalidatePath('/thank-you');
    redirect(`/thank-you?order=${order.orderNumber}`);
  } catch (e:any) {
    return { ok:false, error: e?.message ?? 'Falha ao criar pedido' };
  }
}

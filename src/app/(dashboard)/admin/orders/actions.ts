'use server';

import { revalidatePath } from 'next/cache';
import { updateOrderStatusAdmin, cancelOrderAdmin, refundOrderAdmin } from '@/features/orders/api/api';
import { UpdateOrderStatusPayload } from '@/features/orders/schemas';

export async function updateStatusAction(id: string, _: any, form: FormData) {
  const status = String(form.get('status') ?? '');
  const parsed = UpdateOrderStatusPayload.safeParse({ status });
  if (!parsed.success) return { ok:false, error: parsed.error.issues[0]?.message ?? 'Status inválido' };
  try {
    await updateOrderStatusAdmin(id, parsed.data);
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath('/admin/orders');
    return { ok:true };
  } catch (e: any) {
    return { ok:false, error: e?.message ?? 'Falha ao atualizar status' };
  }
}

export async function cancelOrderAction(id: string) {
  try { await cancelOrderAdmin(id); revalidatePath(`/admin/orders/${id}`); revalidatePath('/admin/orders'); return { ok:true }; }
  catch (e:any) { return { ok:false, error: e?.message ?? 'Falha ao cancelar pedido' }; }
}

export async function refundOrderAction(id: string) {
  try { await refundOrderAdmin(id); revalidatePath(`/admin/orders/${id}`); revalidatePath('/admin/orders'); return { ok:true }; }
  catch (e:any) { return { ok:false, error: e?.message ?? 'Falha ao estornar pedido' }; }
}

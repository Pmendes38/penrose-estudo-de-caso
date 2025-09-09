'use server';

import { revalidatePath } from 'next/cache';
import {
  updateOrderStatusAdmin,
  cancelOrderAdmin,
  refundOrderAdmin,
} from '@/features/orders/api';
import {
  UpdateOrderStatusPayload,
  OrderStatus,
} from '@/features/orders/schemas';

export type State = { ok: boolean; error?: string };

function firstZodIssue(errors: unknown): string {
  try {
    // @ts-ignore
    const issues = errors?.issues ?? [];
    return issues[0]?.message ?? 'Dados inválidos';
  } catch {
    return 'Dados inválidos';
  }
}

export async function updateStatusAction(
  id: string,
  _prev: State,
  form: FormData
): Promise<State> {
  const status = String(form.get('status') ?? '');
  const parsed = UpdateOrderStatusPayload.safeParse({ status });
  if (!parsed.success) return { ok: false, error: firstZodIssue(parsed.error) };

  try {
    await updateOrderStatusAdmin(id, parsed.data);
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath('/admin/orders');
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Falha ao atualizar status' };
  }
}

export async function updateStatusDirectAction(
  id: string,
  status: OrderStatus
): Promise<State> {
  const parsed = UpdateOrderStatusPayload.safeParse({ status });
  if (!parsed.success) return { ok: false, error: firstZodIssue(parsed.error) };

  try {
    await updateOrderStatusAdmin(id, parsed.data);
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath('/admin/orders');
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Falha ao atualizar status' };
  }
}

export async function cancelOrderAction(id: string): Promise<State> {
  try {
    await cancelOrderAdmin(id);
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath('/admin/orders');
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Falha ao cancelar pedido' };
  }
}

export async function refundOrderAction(id: string): Promise<State> {
  try {
    await refundOrderAdmin(id);
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath('/admin/orders');
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Falha ao estornar pedido' };
  }
}

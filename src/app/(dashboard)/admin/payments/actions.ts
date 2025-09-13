'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/shared/lib/http';
import { z } from 'zod';

const IdSchema = z.string().min(1);

export async function cancelPaymentAction(_: unknown, formData: FormData) {
  const id = String(formData.get('id') ?? '');
  const parsed = IdSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: 'ID inválido' };

  try {
    await api(`/api/v1/payments/admin/${encodeURIComponent(parsed.data)}/cancel`, {
      method: 'PUT',
      expectJson: false,
      cache: 'no-store',
    });
    revalidatePath('/admin/payments');
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Falha ao cancelar' };
  }
}

export async function refundPaymentAction(_: unknown, formData: FormData) {
  const id = String(formData.get('id') ?? '');
  const parsed = IdSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: 'ID inválido' };

  try {
    await api(`/api/v1/payments/admin/${encodeURIComponent(parsed.data)}/refund`, {
      method: 'PUT',
      expectJson: false,
      cache: 'no-store',
    });
    revalidatePath('/admin/payments');
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Falha ao estornar' };
  }
}

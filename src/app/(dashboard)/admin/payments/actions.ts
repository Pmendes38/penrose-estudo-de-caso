// src/app/(admin)/admin/payments/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/shared/lib/http';

export async function cancelPaymentAction(_: any, formData: FormData) {
  const id = String(formData.get('id') || '');
  if (!id) return { ok: false, error: 'ID inválido' };
  try {
    await api(`/api/v1/payments/admin/${id}/cancel`, { method: 'PUT', expectJson: false });
    revalidatePath('/admin/payments');
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Falha ao cancelar' };
  }
}

export async function refundPaymentAction(_: any, formData: FormData) {
  const id = String(formData.get('id') || '');
  if (!id) return { ok: false, error: 'ID inválido' };
  try {
    await api(`/api/v1/payments/admin/${id}/refund`, { method: 'PUT', expectJson: false });
    revalidatePath('/admin/payments');
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Falha ao refundar' };
  }
}

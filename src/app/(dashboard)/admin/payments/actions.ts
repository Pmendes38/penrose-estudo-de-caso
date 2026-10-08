'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/shared/lib/http';
import { z } from 'zod';
import { approveDemoPayment } from '@/features/payments/api';
import { requireAdminOrRedirect } from '@/features/auth/server/guards';

const IdSchema = z.string().min(1);

export async function approveDemoPaymentAction(_: unknown, formData: FormData) {
  requireAdminOrRedirect();
  const id = z.string().uuid().safeParse(formData.get('id'));
  if (!id.success) return { ok: false, error: 'ID inválido' };
  try {
    await approveDemoPayment(id.data);
    revalidatePath('/admin/payments');
    revalidatePath('/admin/orders');
    revalidatePath('/admin');
    return { ok: true };
  } catch {
    return { ok: false, error: 'Não foi possível aprovar. Apenas pagamentos DEMO pendentes no ambiente isolado podem ser aprovados aqui.' };
  }
}

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

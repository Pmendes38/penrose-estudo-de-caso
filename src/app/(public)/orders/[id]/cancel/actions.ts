'use server';

import { fetchWithAuth } from '@/features/auth/server/fetch-with-auth';
import { envServer } from '@/shared/lib/env.server';
import { revalidatePath } from 'next/cache';

export async function requestCancellationAction(id: string, reason: string) {
  if (!reason?.trim() || reason.trim().length > 500) return { ok: false, error: 'Informe o motivo do cancelamento.' };
  try {
    const response = await fetchWithAuth(`${envServer.NEXT_PUBLIC_API_BASE_URL}/api/v1/orders/me/order/${encodeURIComponent(id)}/cancellation-request`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason }),
    });
    if (!response.ok) throw new Error('Não foi possível salvar a solicitação. Atualize a página e tente novamente.');
    revalidatePath('/customer');
    revalidatePath(`/orders/${id}`);
    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${id}`);
    return { ok: true };
  } catch (error: any) { return { ok: false, error: error.message }; }
}

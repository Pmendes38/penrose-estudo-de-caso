'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminOrRedirect } from '@/features/auth/server/guards';
import { updateProductionAdmin } from '@/features/orders/api';
import { ProductionStage } from '@/features/orders/schemas';

export async function updateProductionAction(id: string, _: { ok: boolean; error?: string }, formData: FormData) {
  requireAdminOrRedirect();
  const stage = ProductionStage.safeParse(formData.get('stage'));
  if (!stage.success) return { ok: false, error: 'Selecione uma etapa válida.' };
  try {
    await updateProductionAdmin(id, stage.data);
    revalidatePath('/admin/production');
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath(`/orders/${id}`);
    return { ok: true };
  } catch {
    return { ok: false, error: 'Não foi possível atualizar. O pedido precisa estar pago e só pode mover uma etapa por vez. Atualize a página e tente novamente.' };
  }
}

// src/app/(dashboard)/admin/products/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { envServer } from '@/shared/lib/env.server';
import { fetchWithAuth } from '@/features/auth/server/fetch-with-auth';

// já existe
export async function toggleProductStatusAction(id: string, current: 'active'|'inactive') {
  const next = current === 'active' ? 'inactive' : 'active';

  const res = await fetchWithAuth(`${envServer.NEXT_PUBLIC_API_BASE_URL}/api/v1/admin/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({ status: next }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || 'Erro ao atualizar produto');
  }

  revalidatePath('/admin/products');
  return { ok: true };
}

// NOVO: deletar produto
export async function deleteProductAction(id: string) {
  const res = await fetchWithAuth(`${envServer.NEXT_PUBLIC_API_BASE_URL}/api/v1/admin/products/${id}`, {
    method: 'DELETE',
    cache: 'no-store',
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || 'Erro ao excluir produto');
  }

  revalidatePath('/admin/products');
  return { ok: true };
}

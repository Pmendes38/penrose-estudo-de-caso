'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function toggleProductStatusAction(id: string, current: 'active'|'inactive') {
  const token = cookies().get('accessToken')?.value;
  const next = current === 'active' ? 'inactive' : 'active';

  const res = await fetch(`${process.env.AUTH_API_URL}/api/products/admin/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ status: next }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || 'Erro ao atualizar produto');
  }

  revalidatePath('/admin/produtos');
  return { ok: true };
}

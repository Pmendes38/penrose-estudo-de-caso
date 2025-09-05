'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function updateOrderStatusAction(orderId: string, status: string) {
  const token = cookies().get('accessToken')?.value;
  const res = await fetch(`${process.env.AUTH_API_URL}/api/orders/admin/${orderId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ status }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || 'Erro ao atualizar status');
  }

  revalidatePath('/admin/pedidos');
  return { ok: true };
}

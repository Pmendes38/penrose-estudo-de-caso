'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { envServer } from '@/shared/lib/env.server';

export async function saveProductAction(id: string, formData: FormData) {
  const token = cookies().get('accessToken')?.value;
  const payload = Object.fromEntries(formData.entries());

  const res = await fetch(`${envServer.AUTH_API_URL}/api/v1/admin/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || 'Erro ao atualizar produto');
  }

  revalidatePath('/admin/products');
  redirect('/admin/products');
}

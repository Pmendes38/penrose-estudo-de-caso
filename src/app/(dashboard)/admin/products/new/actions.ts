'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { envServer } from '@/shared/lib/env.server';

const ProductInput = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  price: z.coerce.number().nonnegative().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
});

export async function createProductAction(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = ProductInput.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'Dados inválidos';
    throw new Error(msg);
  }

  const token = cookies().get('accessToken')?.value;
  const res = await fetch(`${envServer.AUTH_API_URL}/api/v1/products/admin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(parsed.data),
    cache: 'no-store',
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error('Não autorizado. Faça login novamente.');
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || 'Erro ao criar produto');
  }

  revalidatePath('/admin/produtos');
  redirect('/admin/produtos');
}

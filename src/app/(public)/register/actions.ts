'use server';
import { backendFetch as fetch } from '@/shared/lib/backend-fetch';

export async function publicRegisterAction(formData: {
  name: string; email: string; phone?: string; password: string;
}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify(formData),
  });

  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.message ?? 'Erro no cadastro');
  }

  return res.json();
}

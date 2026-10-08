'use server';
import { backendFetch as fetch } from '@/shared/lib/backend-fetch';

import { cookies } from 'next/headers';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter ao menos 8 caracteres'),
});

export type State = { ok: boolean; error?: string };

export async function adminLoginAction(prev: State, formData: FormData): Promise<State> {
  const parsed = LoginSchema.safeParse({
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos' };
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
      cache: 'no-store',
    });

    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      return { ok: false, error: e?.message ?? 'Falha na autenticação' };
    }

    const data = await res.json();

    const accessToken: string | undefined = data?.tokens?.accessToken;
    if (!accessToken) return { ok: false, error: 'Token não retornado' };

    // cookies seguras (ajuste domain/expires conforme sua necessidade)
    cookies().set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    cookies().set('role', 'admin', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message ?? 'Erro inesperado' };
  }
}

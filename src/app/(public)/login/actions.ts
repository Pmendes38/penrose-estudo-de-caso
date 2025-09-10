'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { envServer } from '@/shared/lib/env.server';
import { setAuthCookies } from '@/features/auth/server/cookies';

const LoginInput = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter ao menos 8 caracteres'),
});

const LoginResponseSchema = z.object({
  role: z.enum(['admin', 'customer']),
  redirect: z.string().optional(),
  tokens: z.object({
    accessToken: z.string(),
    refreshToken: z.string().optional(),
  }),
});

export type LoginState = { ok: boolean; error?: string };

function safeMessage(j: unknown, fallback: string) {
  try {
    if (j && typeof j === 'object' && 'message' in j) return String((j as any).message);
  } catch {}
  return fallback;
}

function isSafeRelativePath(p?: string): p is string {
  return !!p && p.startsWith('/') && !p.startsWith('//');
}

export async function loginAction(_: LoginState, form: FormData): Promise<LoginState> {
  const parsed = LoginInput.safeParse({
    email: String(form.get('email') ?? ''),
    password: String(form.get('password') ?? ''),
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? 'Dados inválidos';
    return { ok: false, error: first };
  }

  const nextRaw = String(form.get('next') ?? '');

  const res = await fetch(`${envServer.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify(parsed.data),
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    return { ok: false, error: safeMessage(payload, 'Falha na autenticação') };
  }

  const data = LoginResponseSchema.parse(await res.json());

  setAuthCookies(data.tokens.accessToken, data.role, {
    refreshToken: data.tokens.refreshToken,
  });

  const dest = isSafeRelativePath(nextRaw)
    ? nextRaw
    : data.role === 'admin'
    ? '/admin'
    : isSafeRelativePath(data.redirect)
    ? data.redirect
    : '/catalog';

  redirect(dest);
}

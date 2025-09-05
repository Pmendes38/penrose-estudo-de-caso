'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { envServer } from '@/shared/lib/env.server';

const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter ao menos 8 caracteres'),
});

type State = { ok: boolean; error?: string };

function parseJwtExp(token: string): Date | undefined {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
    if (payload?.exp && Number.isFinite(payload.exp)) {
      return new Date(payload.exp * 1000);
    }
  } catch {}
  return undefined;
}

export async function adminLoginAction(_prev: State, formData: FormData): Promise<State> {
  const parsed = LoginSchema.safeParse({
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(`${envServer.AUTH_API_URL}/api/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!res.ok) {
      let message = 'Falha na autenticação';
      try {
        const json = await res.json();
        if (json?.message) message = json.message;
      } catch {}
      return { ok: false, error: message };
    }

    const data = await res.json();
    const accessToken: string | undefined = data?.tokens?.accessToken;
    if (!accessToken) return { ok: false, error: 'Token não retornado pelo servidor' };

    const exp = parseJwtExp(accessToken);

    const cookieBase = {
      httpOnly: true,
      secure: envServer.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      ...(envServer.COOKIE_DOMAIN ? { domain: envServer.COOKIE_DOMAIN } : {}),
      ...(exp ? { expires: exp } : { maxAge: 60 * 60 * 2 }), // 2h fallback
    };

    cookies().set('accessToken', accessToken, cookieBase);
    cookies().set('role', 'admin', cookieBase);

    redirect('/admin');
  } catch (err: any) {
    if (err?.name === 'AbortError') return { ok: false, error: 'Tempo de resposta excedido' };
    return { ok: false, error: 'Erro inesperado ao autenticar' };
  } finally {
    clearTimeout(timeout);
  }
}

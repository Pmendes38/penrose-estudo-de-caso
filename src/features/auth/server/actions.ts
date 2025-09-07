// src/features/auth/server/actions.ts
'use server';

import { z } from 'zod';
import { envServer } from '@/shared/lib/env.server';
import { setAuthCookies, clearAuthCookies } from './cookies';
import { AuthResultSchema } from './schemas';

const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter ao menos 8 caracteres'),
});

export type ActionState = { ok: boolean; error?: string };

export async function adminLoginAction(_: ActionState, form: FormData): Promise<ActionState> {
  const parsed = LoginSchema.safeParse({
    email: String(form.get('email') ?? ''),
    password: String(form.get('password') ?? ''),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos' };

  try {
    const res = await fetch(`${envServer.AUTH_API_URL}/api/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(parsed.data),
      cache: 'no-store',
    });
    if (!res.ok) {
      let msg = 'Falha na autenticação';
      try { msg = (await res.json())?.message ?? msg; } catch {}
      return { ok:false, error: msg };
    }
    const data = AuthResultSchema.parse(await res.json());
    setAuthCookies(data.tokens.accessToken, 'admin', { refreshToken: data.tokens.refreshToken });
    return { ok: true };
  } catch (e: any) {
    return { ok:false, error: e?.message ?? 'Erro inesperado' };
  }
}

export async function loginAction(_: ActionState, form: FormData): Promise<ActionState> {
  const parsed = LoginSchema.safeParse({
    email: String(form.get('email') ?? ''),
    password: String(form.get('password') ?? ''),
  });
  if (!parsed.success) return { ok:false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos' };

  try {
    const res = await fetch(`${envServer.AUTH_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(parsed.data),
      cache: 'no-store',
    });
    if (!res.ok) {
      let msg = 'Falha na autenticação';
      try { msg = (await res.json())?.message ?? msg; } catch {}
      return { ok:false, error: msg };
    }
    const data = AuthResultSchema.parse(await res.json());
    setAuthCookies(data.tokens.accessToken, data.role, { refreshToken: data.tokens.refreshToken });
    return { ok: true };
  } catch (e: any) {
    return { ok:false, error: e?.message ?? 'Erro inesperado' };
  }
}

export async function registerAction(_: ActionState, form: FormData): Promise<ActionState> {
  const payload = {
    name: String(form.get('name') ?? ''),
    email: String(form.get('email') ?? ''),
    password: String(form.get('password') ?? ''),
    phone: form.get('phone') ? String(form.get('phone')) : undefined,
    acceptTerms: true,
  };
  try {
    const res = await fetch(`${envServer.AUTH_API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
    if (!res.ok) {
      let msg = 'Falha no registro';
      try { msg = (await res.json())?.message ?? msg; } catch {}
      return { ok:false, error: msg };
    }
    // Registro OK — opcionalmente já fazer login automático chamando loginAction
    return { ok:true };
  } catch (e: any) {
    return { ok:false, error: e?.message ?? 'Erro inesperado' };
  }
}

export async function logoutAction(): Promise<{ ok: true }> {
  clearAuthCookies();
  return { ok: true };
}

// src/features/auth/server/actions.ts
'use server';

import { z } from 'zod';
import { adminLogin, login, register, logout } from '../api';

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
    await adminLogin(parsed.data.email, parsed.data.password);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Falha na autenticação' };
  }
}

export async function loginAction(_: ActionState, form: FormData): Promise<ActionState> {
  const parsed = LoginSchema.safeParse({
    email: String(form.get('email') ?? ''),
    password: String(form.get('password') ?? ''),
  });
  if (!parsed.success) return { ok:false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos' };

  try {
    await login(parsed.data.email, parsed.data.password);
    return { ok:true };
  } catch (e: any) {
    return { ok:false, error: e?.message ?? 'Falha na autenticação' };
  }
}

export async function registerAction(_: ActionState, form: FormData): Promise<ActionState> {
  const payload = {
    name: String(form.get('name') ?? ''),
    email: String(form.get('email') ?? ''),
    password: String(form.get('password') ?? ''),
    phone: form.get('phone') ? String(form.get('phone')) : undefined,
  };
  try {
    await register(payload);
    return { ok:true };
  } catch (e: any) {
    return { ok:false, error: e?.message ?? 'Falha no registro' };
  }
}

export async function logoutAction(): Promise<{ ok: boolean; message?: string }> {
  const result = await logout();
  return { ok: result.ok ?? false, message: result.message };
}

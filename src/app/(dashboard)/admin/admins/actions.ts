'use server';

import { revalidatePath } from 'next/cache';
import { CreateAdminPayload, UpdateAdminPayload } from '@/features/admins/schemas';
import { createAdmin, updateAdmin, deleteAdmin } from '@/features/admins/api/api';

export async function createAdminAction(_: any, form: FormData) {
  const parsed = CreateAdminPayload.safeParse({
    name: String(form.get('name') ?? ''),
    email: String(form.get('email') ?? ''),
    password: String(form.get('password') ?? ''),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message || 'Dados inválidos' };

  try {
    await createAdmin(parsed.data);
    revalidatePath('/admin/admins'); // atualiza listagem
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Falha ao criar admin' };
  }
}

export async function updateAdminAction(id: string, _: any, form: FormData) {
  const parsed = UpdateAdminPayload.safeParse({
    name: form.get('name') ? String(form.get('name')) : undefined,
    email: form.get('email') ? String(form.get('email')) : undefined,
    password: form.get('password') ? String(form.get('password')) : undefined,
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message || 'Dados inválidos' };

  try {
    await updateAdmin(id, parsed.data);
    revalidatePath('/admin/admins');
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Falha ao atualizar admin' };
  }
}

export async function deleteAdminAction(id: string) {
  try {
    await deleteAdmin(id);
    revalidatePath('/admin/admins');
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Falha ao remover admin' };
  }
}

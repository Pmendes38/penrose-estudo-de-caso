import { envServer } from '@/shared/lib/env.server';
import { fetchWithAuth } from '@/features/auth/server/fetch-with-auth';
import { PagedAdminsSchema, AdminSchema, type PagedAdmins, type CreateAdminPayload, type UpdateAdminPayload } from '../schemas';

export async function listAdmins(params?: { page?: number; pageSize?: number }): Promise<PagedAdmins> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.pageSize) qs.set('pageSize', String(params.pageSize));
  const res = await fetchWithAuth(`${envServer.AUTH_API_URL}/api/v1/admins?${qs}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Falha ao listar admins: ${res.status}`);
  return PagedAdminsSchema.parse(await res.json());
}

export async function getAdmin(id: string) {
  const res = await fetchWithAuth(`${envServer.AUTH_API_URL}/api/v1/admins/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Falha ao obter admin: ${res.status}`);
  return AdminSchema.parse(await res.json());
}

export async function createAdmin(payload: CreateAdminPayload) {
  const res = await fetchWithAuth(`${envServer.AUTH_API_URL}/api/v1/admins`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.text()) || 'Falha ao criar admin');
  return AdminSchema.parse(await res.json());
}

export async function updateAdmin(id: string, payload: UpdateAdminPayload) {
  const res = await fetchWithAuth(`${envServer.AUTH_API_URL}/api/v1/admins/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.text()) || 'Falha ao atualizar admin');
  return AdminSchema.parse(await res.json());
}

export async function deleteAdmin(id: string) {
  const res = await fetchWithAuth(`${envServer.AUTH_API_URL}/api/v1/admins/${id}`, {
    method: 'DELETE',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error((await res.text()) || 'Falha ao remover admin');
  return (await res.json()) as { message: string };
}

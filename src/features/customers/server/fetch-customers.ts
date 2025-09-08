import 'server-only';
import { envServer } from '@/shared/lib/env.server';
import { fetchWithAuth } from '@/features/auth/server/fetch-with-auth';
import { CustomersPageSchema } from '../schemas';

type FetchParams = { page?: number; pageSize?: number; q?: string };

export async function fetchAdminCustomers({ page = 1, pageSize = 20, q }: FetchParams) {
  const url = new URL(`${envServer.AUTH_API_URL}/api/customers/admin`);
  url.searchParams.set('page', String(page));
  url.searchParams.set('pageSize', String(pageSize));
  if (q) url.searchParams.set('q', q);

  const res = await fetchWithAuth(url.toString(), { cache: 'no-store' });
  const text = await res.text();

  if (!res.ok) {
    try {
      const err = JSON.parse(text);
      throw new Error(err?.message || `Falha ao buscar clientes (${res.status})`);
    } catch {
      throw new Error(`Falha ao buscar clientes (${res.status})`);
    }
  }

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error('Resposta inválida do servidor (não é JSON)');
  }

  return CustomersPageSchema.parse(json);
}

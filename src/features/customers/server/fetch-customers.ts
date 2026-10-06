import 'server-only';
import { envServer } from '@/shared/lib/env.server';
import { fetchWithAuth } from '@/features/auth/server/fetch-with-auth';
import { CustomersPageSchema } from '../schemas';

export async function fetchAdminCustomers() {
  const res = await fetchWithAuth(`${envServer.NEXT_PUBLIC_API_BASE_URL}/api/v1/user/admin/customers`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Falha ao buscar clientes (${res.status})`);
  return CustomersPageSchema.parse(await res.json());
}

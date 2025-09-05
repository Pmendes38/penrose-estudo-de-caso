import 'server-only';
import { CustomersPageSchema } from '../schemas';
import { api } from '@/shared/lib/http';

type FetchParams = { page: number; pageSize: number; q?: string; token?: string };

export async function fetchAdminCustomers({ page, pageSize, q, token }: FetchParams) {
  const url = new URL('/api/customers/admin', process.env.NEXT_PUBLIC_API_BASE_URL!);
  url.searchParams.set('page', String(page));
  url.searchParams.set('pageSize', String(pageSize));
  if (q) url.searchParams.set('q', q);

  const res = await api<Response>(url.toString(), {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const json = await res.json().catch(() => {
    throw new Error('Resposta inválida do servidor (não é JSON)');
  });

  return CustomersPageSchema.parse(json);
}
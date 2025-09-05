import { cookies } from 'next/headers';
import ProductsTable from './table';
import { z } from 'zod';
import { envServer } from '@/shared/lib/env.server';

const SP = z.object({
  q: z.string().optional(),
  status: z.enum(['active','inactive']).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export default async function AdminProdutos({ searchParams }: { searchParams: Record<string,string|undefined> }) {
  const { q, status, page, pageSize } = SP.parse(searchParams);
  const token = cookies().get('accessToken')?.value;

  const url = new URL(`${envServer.AUTH_API_URL}/api/products/admin`);
  url.searchParams.set('page', String(page));
  url.searchParams.set('pageSize', String(pageSize));
  if (q) url.searchParams.set('q', q);
  if (status) url.searchParams.set('status', status);

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  });

  if (res.status === 401 || res.status === 403) {
    return (
      <div className="bg-red-900/40 border border-red-600 text-red-200 px-4 py-3 rounded-lg">
        Não autorizado. Faça login novamente.
      </div>
    );
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || 'Erro ao buscar produtos');
  }

  const data = await res.json(); // { items, total, page, pageSize }
  return <ProductsTable data={data} />;
}

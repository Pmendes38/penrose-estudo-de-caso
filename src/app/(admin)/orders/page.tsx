// app/(admin)/orders/page.tsx
import { cookies } from 'next/headers';
import OrdersTable from './table';
import { z } from 'zod';

const SP = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  q: z.string().optional(),
  status: z.enum(['pending','processing','shipped','delivered','cancelled']).optional(),
});

export default async function AdminPedidos({ searchParams }: { searchParams: Record<string,string|undefined> }) {
  const { page, pageSize, q, status } = SP.parse(searchParams);
  const token = cookies().get('accessToken')?.value;

  const url = new URL(`${process.env.AUTH_API_URL}/api/orders/admin`);
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
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-brand-gray-light">Pedidos</h2>
        <div className="bg-red-900/40 border border-red-600 text-red-200 px-4 py-3 rounded-lg">
          Não autorizado. Faça login novamente.
        </div>
      </div>
    );
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || 'Erro ao buscar pedidos');
  }

  const data = await res.json();
  return <OrdersTable data={data} />;
}

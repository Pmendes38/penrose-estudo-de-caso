// src/app/(dashboard)/admin/orders/page.tsx
import { listOrdersAdmin } from '@/features/orders/api/api';

export const dynamic = 'force-dynamic';

export default async function OrdersAdminPage({ searchParams }: { searchParams: { page?: string } }) {
  const page = Number(searchParams.page ?? '1') || 1;
  const pageSize = 20;
  const { items, pages } = await listOrdersAdmin({ page, pageSize });

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Pedidos</h1>

      <div className="overflow-x-auto border border-brand-gray-border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-brand-gray-dark">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Cliente</th>
              <th className="px-3 py-2">Total</th>
              <th className="px-3 py-2">Criado em</th>
              <th className="px-3 py-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map(o => (
              <tr key={o.id} className="border-t border-brand-gray-border">
                <td className="px-3 py-2 font-mono">{o.orderNumber}</td>
                <td className="px-3 py-2 capitalize">{o.status}</td>
                <td className="px-3 py-2">{o.customerId}</td>
                <td className="px-3 py-2">R$ {o.grandTotal.toFixed(2)}</td>
                <td className="px-3 py-2">{new Date(o.createdAt).toLocaleString('pt-BR')}</td>
                <td className="px-3 py-2 text-right">
                  <a className="underline" href={`/admin/orders/${o.id}`}>Ver</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <nav className="flex gap-2">
        {Array.from({ length: pages }).map((_, i) => {
          const p = i + 1; const active = p === page;
          return (
            <a key={p} href={`/admin/orders?page=${p}`} className={`px-3 py-1 rounded ${active ? 'bg-brand-blue text-black' : 'border border-brand-gray-border'}`}>{p}</a>
          );
        })}
      </nav>
    </div>
  );
}

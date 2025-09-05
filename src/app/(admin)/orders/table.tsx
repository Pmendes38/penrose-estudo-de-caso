// app/(admin)/orders/table.tsx
'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { updateOrderStatusAction } from './actions';

function formatBRL(n: number) {
  return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n ?? 0);
}
function formatDate(v: string) {
  return new Date(v).toLocaleDateString('pt-BR');
}

export default function OrdersTable({ data }: { data: { items: any[]; total: number; page: number; pageSize: number } }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, start] = useTransition();

  const page = Number(params.get('page') ?? data.page ?? 1);
  const pageSize = Number(params.get('pageSize') ?? data.pageSize ?? 20);
  const q = params.get('q') ?? '';
  const status = params.get('status') ?? '';

  const totalPages = Math.max(1, Math.ceil((data.total ?? 0) / pageSize));

  const setParam = (k: string, v?: string) => {
    const next = new URLSearchParams(params);
    if (!v) next.delete(k); else next.set(k, v);
    router.replace(`?${next.toString()}`, { scroll: false });
  };

  const updateStatus = (id: string, s: string) => {
    start(async () => {
      try {
        await updateOrderStatusAction(id, s);
      } catch (e: any) {
        alert(e.message ?? 'Erro ao atualizar status');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-brand-gray-light">Pedidos</h2>
          <p className="mt-1 text-sm text-brand-gray">Gerencie todos os pedidos do sistema</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="search"
          placeholder="Buscar por ID do pedido ou cliente…"
          className="flex-1 bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-2 px-4 rounded-lg focus:outline-none focus:border-brand-blue"
          defaultValue={q}
          onChange={(e) => setParam('q', e.target.value || undefined)}
        />
        <select
          className="bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-2 px-4 rounded-lg focus:outline-none focus:border-brand-blue"
          value={status}
          onChange={(e) => {
            setParam('status', e.target.value || undefined);
            setParam('page', '1');
          }}
        >
          <option value="">Todos os status</option>
          <option value="pending">Pendente</option>
          <option value="processing">Processando</option>
          <option value="shipped">Enviado</option>
          <option value="delivered">Entregue</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>

      {/* Lista */}
      <div className="bg-brand-gray-dark rounded-lg border border-brand-gray-border">
        <div className="px-6 py-4 border-b border-brand-gray-border">
          <h3 className="text-lg font-medium text-brand-gray-light">
            Pedidos Recentes ({data.items.length})
          </h3>
        </div>

        <div className="divide-y divide-brand-gray-border">
          {data.items.map((order) => (
            <div key={order.id} className="p-6 hover:bg-brand-gray/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-brand-gray-light">Pedido #{order.id}</h4>
                  <p className="text-sm text-brand-gray">{order.customer} • {order.email}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-brand-blue font-semibold">{formatBRL(order.total)}</span>
                    <span className="text-sm text-brand-gray">{order.items} {order.items === 1 ? 'item' : 'itens'}</span>
                    <span className="text-sm text-brand-gray">{formatDate(order.date)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/admin/pedidos/${order.id}`} className="text-brand-blue hover:text-blue-400 px-3 py-1 rounded">
                    👁️ Ver
                  </Link>
                  <select
                    className="bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-1 px-2 rounded text-sm focus:outline-none focus:border-brand-blue"
                    defaultValue={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    disabled={pending}
                  >
                    <option value="pending">Pendente</option>
                    <option value="processing">Processando</option>
                    <option value="shipped">Enviado</option>
                    <option value="delivered">Entregue</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {data.items.length === 0 && (
          <div className="p-12 text-center text-brand-gray">Nenhum pedido encontrado.</div>
        )}

        {/* Paginação */}
        <div className="px-6 py-4 border-t border-brand-gray-border flex items-center justify-between text-sm text-brand-gray">
          <span>Página {page} de {totalPages}</span>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 rounded bg-gray-800 border border-gray-700 disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setParam('page', String(page - 1))}
            >
              Anterior
            </button>
            <button
              className="px-3 py-1 rounded bg-gray-800 border border-gray-700 disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => setParam('page', String(page + 1))}
            >
              Próxima
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

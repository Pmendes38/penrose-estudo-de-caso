'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { updateStatusDirectAction } from './actions';
import type { Order, OrderStatus } from '@/features/orders/schemas';

function formatBRL(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n ?? 0);
}
function formatDate(v: string | Date) {
  const d = new Date(v as any);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('pt-BR');
}

const ALL_STATUSES: OrderStatus[] = [
  'pending',
  'processing',
  'paid',
  'shipped',
  'delivered',
  'canceled',
  'refunded',
];

type TableData = {
  items: Order[];
  total: number;
  page: number;
  pageSize: number;
};

export default function OrdersTable({ data }: { data: TableData }) {
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
    if (!v) next.delete(k);
    else next.set(k, v);
    router.replace(`?${next.toString()}`, { scroll: false });
  };

  const updateStatus = (id: string, s: OrderStatus) => {
    start(async () => {
      const res = await updateStatusDirectAction(id, s);
      if (!res.ok) alert(res.error ?? 'Erro ao atualizar status');
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
          placeholder="Buscar por # do pedido ou cliente…"
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
          <option value="paid">Pago</option>
          <option value="shipped">Enviado</option>
          <option value="delivered">Entregue</option>
          <option value="canceled">Cancelado</option>
          <option value="refunded">Estornado</option>
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
                  <h4 className="text-lg font-medium text-brand-gray-light">
                    Pedido #{order.orderNumber}
                  </h4>
                  <p className="text-sm text-brand-gray">Cliente: {order.customerId}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-brand-blue font-semibold">
                      {formatBRL(order.grandTotal)}
                    </span>
                    <span className="text-sm text-brand-gray">
                      {order.items?.length ?? 0} {order.items?.length === 1 ? 'item' : 'itens'}
                    </span>
                    <span className="text-sm text-brand-gray">{formatDate(order.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-brand-blue hover:text-blue-400 px-3 py-1 rounded"
                  >
                    👁️ Ver
                  </Link>
                  <select
                    className="bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-1 px-2 rounded text-sm focus:outline-none focus:border-brand-blue"
                    defaultValue={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                    disabled={pending}
                  >
                    {ALL_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
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
          <span>
            Página {page} de {totalPages}
          </span>
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

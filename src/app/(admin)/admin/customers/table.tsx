'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { formatBRL, formatDate } from '@/shared/lib/format';
import type { Customer } from '@/shared/lib/types';

type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export default function CustomersTable({ data }: { data: Paginated<Customer> }) {
  const router = useRouter();
  const params = useSearchParams();

  const page = Number(params.get('page') ?? data.page ?? 1);
  const pageSize = Number(params.get('pageSize') ?? data.pageSize ?? 20);
  const q = params.get('q') ?? '';

  const totalPages = Math.max(1, Math.ceil((data.total ?? 0) / pageSize));

  const setParam = (key: string, value?: string) => {
    const next = new URLSearchParams(params);
    if (!value || value === '') next.delete(key);
    else next.set(key, value);
    router.replace(`?${next.toString()}`, { scroll: false });
  };

  const goTo = (p: number) => setParam('page', String(p));

  return (
    <div className="bg-brand-gray-dark rounded-lg border border-brand-gray-border">
      <div className="px-6 py-4 border-b border-brand-gray-border flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <h3 className="text-lg font-medium text-brand-gray-light">
          Lista de Clientes ({data.total})
        </h3>

        <div className="flex gap-2">
          <input
            type="search"
            placeholder="Buscar por nome/email…"
            className="px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-sm text-white w-64"
            defaultValue={q}
            onChange={(e) => setParam('q', e.target.value || undefined)}
            aria-label="Buscar clientes"
          />
          <select
            className="px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-sm text-white"
            value={String(pageSize)}
            onChange={(e) => {
              setParam('pageSize', e.target.value);
              setParam('page', '1'); // reset página ao mudar pageSize
            }}
            aria-label="Itens por página"
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>{n}/página</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista */}
      <div className="divide-y divide-brand-gray-border">
        {data.items.length === 0 ? (
          <div className="p-6 text-brand-gray">Nenhum cliente encontrado.</div>
        ) : (
          data.items.map((client) => (
            <div key={client.id} className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-lg font-medium text-brand-gray-light">{client.name}</h4>
                  <p className="text-sm text-brand-gray">{client.email}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                    {client.phone && <span className="text-brand-gray">{client.phone}</span>}
                    <span className="text-brand-gray">{client.totalOrders} pedidos</span>
                    <span className="text-brand-blue font-semibold">
                      {formatBRL(client.totalSpent)} gastos
                    </span>
                    <span className="text-brand-gray">
                      Último pedido: {formatDate(client.lastOrder)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      client.status === 'active'
                        ? 'bg-green-900/50 text-green-200'
                        : 'bg-gray-700 text-gray-200'
                    }`}
                  >
                    {client.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Paginação */}
      <div className="px-6 py-4 border-t border-brand-gray-border flex items-center justify-between text-sm text-brand-gray">
        <span>
          Página {page} de {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 rounded bg-gray-800 border border-gray-700 disabled:opacity-50"
            onClick={() => goTo(Math.max(1, page - 1))}
            disabled={page <= 1}
          >
            Anterior
          </button>
          <button
            className="px-3 py-1 rounded bg-gray-800 border border-gray-700 disabled:opacity-50"
            onClick={() => goTo(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
}

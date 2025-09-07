'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { toggleProductStatusAction } from './actions';

function formatBRL(n: number) {
  return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n ?? 0);
}

export default function ProductsTable({ data }: { data: { items: any[]; total: number; page: number; pageSize: number } }) {
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

  const onToggle = (p: any) => {
    start(async () => {
      try {
        await toggleProductStatusAction(p.id, p.status);
      } catch (e: any) {
        alert(e.message ?? 'Erro ao atualizar produto');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-brand-gray-light">Produtos</h2>
          <p className="mt-1 text-sm text-brand-gray">Gerencie seu catálogo de produtos</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.refresh()}
            className="bg-brand-gray-dark hover:bg-brand-gray/60 text-brand-gray-light font-semibold py-2 px-4 rounded-lg"
          >
            ↻ Atualizar
          </button>
          <Link
            href="/admin/produtos/novo"
            className="bg-brand-blue hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
          >
            ➕ Novo Produto
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="search"
          placeholder="Buscar produtos…"
          className="flex-1 bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-2 px-4 rounded-lg focus:outline-none focus:border-brand-blue"
          defaultValue={q}
          onChange={(e) => { setParam('q', e.target.value || undefined); setParam('page', '1'); }}
        />
        <select
          className="bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-2 px-4 rounded-lg focus:outline-none focus:border-brand-blue"
          value={status}
          onChange={(e) => { setParam('status', e.target.value || undefined); setParam('page', '1'); }}
        >
          <option value="">Todos os status</option>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
        </select>
      </div>

      {/* Lista */}
      <div className="bg-brand-gray-dark rounded-lg border border-brand-gray-border">
        <div className="px-6 py-4 border-b border-brand-gray-border">
          <h3 className="text-lg font-medium text-brand-gray-light">
            Lista de Produtos ({data.items.length})
          </h3>
        </div>

        <div className="divide-y divide-brand-gray-border">
          {data.items.map((p) => (
            <div key={p.id} className="p-6 hover:bg-brand-gray/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Image
                    src={p.image ?? '/assets/products/venom/venom-1.jpg'}
                    alt={p.name ?? 'Produto'}
                    width={64}
                    height={64}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="text-lg font-medium text-brand-gray-light">{p.name ?? 'Produto'}</h4>
                    <p className="text-sm text-brand-gray">{p.category ?? '-'}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-brand-blue font-semibold">{formatBRL(p.price ?? 0)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.status === 'active' ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'
                      }`}>
                        {p.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                      <span className="text-sm text-brand-gray">Estoque: {p.stock ?? 0}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/admin/produtos/editar/${p.id}`} className="text-brand-blue hover:text-blue-400 px-3 py-1 rounded">
                    ✏️ Editar
                  </Link>
                  <Link href={`/produto/${p.id}`} target="_blank" className="text-brand-gray hover:text-brand-gray-light px-3 py-1 rounded">
                    👁️ Ver
                  </Link>
                  <button
                    className="text-yellow-300 hover:text-yellow-200 px-3 py-1 rounded"
                    onClick={() => onToggle(p)}
                    disabled={pending}
                    title={p.status === 'active' ? 'Desativar' : 'Ativar'}
                  >
                    {p.status === 'active' ? '⏸️ Desativar' : '▶️ Ativar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {data.items.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-brand-gray-light mb-2">Nenhum produto encontrado</h3>
            <p className="text-brand-gray mb-4">Comece criando seu primeiro produto.</p>
            <Link
              href="/admin/produtos/novo"
              className="bg-brand-blue hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg inline-flex items-center"
            >
              ➕ Criar Primeiro Produto
            </Link>
          </div>
        )}

        {/* Paginação */}
        <div className="px-6 py-4 border-t border-brand-gray-border flex items-center justify-between text-sm text-brand-gray">
          <span>Página {page} de {Math.max(1, Math.ceil((data.total ?? 0) / pageSize))}</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded bg-gray-800 border border-gray-700 disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setParam('page', String(page - 1))}
            >
              Anterior
            </button>
            <button className="px-3 py-1 rounded bg-gray-800 border border-gray-700 disabled:opacity-50"
              disabled={page >= Math.max(1, Math.ceil((data.total ?? 0) / pageSize))}
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

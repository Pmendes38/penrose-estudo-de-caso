'use client';

import { useMemo, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/features/products/ui/ProductCard';
import type { Product } from '@/features/products/schemas';
import type { ProductView } from '@/features/products/normalizers'
import { normalizeProducts } from '@/features/products/normalizers';

const FILTERS = ['all', 'anime', 'serie', 'filme', 'dorama', 'promocao'] as const;

export default function LandingCatalog({ products }: { products: Product[] | any[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const activeFilter = (params.get('filter') ?? 'all').toLowerCase();
  const searchTerm = (params.get('q') ?? '').trim().toLowerCase();

  const normalized: ProductView[] = useMemo(() => normalizeProducts(products), [products]);

  const filtered = useMemo(() => {
    return normalized.filter((p) => {
      const byFilter = activeFilter === 'all' || p.tags.includes(activeFilter);
      const bySearch =
        !searchTerm ||
        p.name.toLowerCase().includes(searchTerm) ||
        p.tags.join(' ').toLowerCase().includes(searchTerm);
      return byFilter && bySearch;
    });
  }, [normalized, activeFilter, searchTerm]);

  const replaceParam = (key: string, value?: string) => {
    startTransition(() => {
      const next = new URLSearchParams(params);
      if (!value) next.delete(key);
      else next.set(key, value);
      router.replace(`?${next.toString()}#catalogo`, { scroll: false });
    });
  };

  return (
    <section id="catalogo" className="py-20 md:py-32 bg-black">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header + filtros */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Catálogo</h2>

          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => replaceParam('filter', f === 'all' ? '' : f)}
                className={`px-3 py-1.5 rounded border text-sm ${
                  activeFilter === f
                    ? 'border-brand-blue text-white'
                    : 'border-brand-gray-border text-brand-gray hover:text-white'
                }`}
              >
                {f === 'all' ? 'Todos' : f}
              </button>
            ))}
          </div>
        </div>

        {/* Busca */}
        <div className="mb-8">
          <input
            className="w-full md:w-96 bg-brand-black border border-brand-gray-border rounded px-3 py-2 text-brand-gray-light"
            placeholder="Buscar por nome ou tag…"
            defaultValue={params.get('q') ?? ''}
            onChange={(e) => replaceParam('q', e.target.value || '')}
            aria-label="Buscar produtos"
          />
        </div>

        {isPending && <div className="text-brand-gray-light mb-6">Atualizando…</div>}

        {filtered.length === 0 ? (
          <p className="text-brand-gray text-center">Nenhum produto encontrado.</p>
        ) : (
          <div className="flex flex-wrap justify-center gap-8">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

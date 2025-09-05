'use client';

import { useMemo, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/Product/ProductCard';
import type { Product } from '@/lib/types';

const FILTERS = ['all', 'anime', 'serie', 'filme', 'dorama', 'promocao'] as const;

export default function LandingCatalog({ products }: { products: Product[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const activeFilter = params.get('filter') ?? 'all';
  const searchTerm = params.get('q') ?? '';

  const toArray = (v: unknown) =>
    Array.isArray(v) ? v : typeof v === 'string' ? v.split(/[\s,]+/).filter(Boolean) : [];

  const normalized = useMemo(
    () =>
      products.map((p) => ({
        ...p,
        images: p.moreImages?.length ? p.moreImages : p.mainImage ? [p.mainImage] : [],
        price: p.sizes?.[0]?.price ?? 0,
        tags: toArray(p.tags),
      })),
    [products]
  );

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return normalized.filter((p: any) => {
      const byFilter = activeFilter === 'all' || (Array.isArray(p.tags) && p.tags.includes(activeFilter));
      const bySearch =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        (Array.isArray(p.tags) && p.tags.join(' ').toLowerCase().includes(q));
      return byFilter && bySearch;
    });
  }, [normalized, activeFilter, searchTerm]);

  const setParam = (key: string, value?: string) => {
    const newParams = new URLSearchParams(params);
    if (!value) newParams.delete(key);
    else newParams.set(key, value);
    startTransition(() => router.replace(`?${newParams.toString()}#catalogo`, { scroll: false }));
  };

  return (
    <section id="catalogo" className="py-20 md:py-32 bg-black">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Catálogo Completo</h2>
          <p className="mt-2 text-gray-400">Explore nosso portfólio e encomende sua próxima obra de arte.</p>
        </div>

        <div className="flex flex-col items-center mb-12 w-full">
          <input
            type="search"
            inputMode="search"
            aria-label="Pesquisar por nome ou tag"
            placeholder="Pesquisar por nome ou tag…"
            className="w-full max-w-lg px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none"
            defaultValue={searchTerm}
            onChange={(e) => setParam('q', e.target.value || undefined)}
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-12">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setParam('filter', f === 'all' ? undefined : f)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeFilter === f ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              aria-pressed={activeFilter === f}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {isPending && <div className="text-brand-gray-light mb-6">Atualizando…</div>}

        <div className="flex flex-wrap justify-center gap-8">
          {filtered.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

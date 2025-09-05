'use client';

import { useMemo, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/features/products/ui/ProductCard';
import type { ProductView, Product } from '@/features/products/schemas';
import { normalizeProducts } from '@/features/products/normalizers';

const FILTERS = ['all', 'anime', 'serie', 'filme', 'dorama', 'promocao'] as const;

export default function LandingCatalog({ products }: { products: Product[] | any[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const activeFilter = params.get('filter') ?? 'all';
  const searchTerm = params.get('q') ?? '';

  const normalized: ProductView[] = useMemo(() => normalizeProducts(products), [products]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return normalized.filter((p) => {
      const byFilter = activeFilter === 'all' || p.tags.includes(activeFilter);
      const bySearch = !q || p.name.toLowerCase().includes(q) || p.tags.join(' ').toLowerCase().includes(q);
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
        {/* ... cabeçalho e filtros ... */}
        {isPending && <div className="text-brand-gray-light mb-6">Atualizando…</div>}
        <div className="flex flex-wrap justify-center gap-8">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

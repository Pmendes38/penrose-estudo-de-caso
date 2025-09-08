'use client';

import { useMemo } from 'react';
import ProductCard from '@/features/products/ui/ProductCard';
import type { Product } from '@/features/products/schemas';
import type { ProductView } from '@/features/products/normalizers'
import { normalizeProducts } from '@/features/products/normalizers';

function isReady(p: any) {
  if (typeof p?.stock === 'number' && p.stock > 0) return true;
  if (Array.isArray(p?.tags) && p.tags.some((t: string) => /ready|pronta/i.test(t))) return true;
  if (Array.isArray(p?.sizes) && p.sizes.some((s: any) => Number(s?.stock || 0) > 0)) return true;
  if (p?.prontaEntrega) return true; // compat legado
  return false;
}

export default function LandingReady({ products }: { products: Product[] | any[] }) {
  const ready = useMemo(() => (products || []).filter(isReady), [products]);
  if (ready.length === 0) return null;

  const normalized: ProductView[] = useMemo(() => normalizeProducts(ready), [ready]);

  return (
    <section id="pronta-entrega" className="py-20 md:py-32">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Peças a Pronta Entrega</h2>
          <p className="mt-2 text-gray-400">
            Obras exclusivas disponíveis para envio imediato. Estoque limitado.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {normalized.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

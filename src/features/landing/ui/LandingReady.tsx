// src/features/landing/ui/LandingReady.tsx
import { useMemo } from 'react';
import ProductCard from '@/features/products/ui/ProductCard';
import type { Product, ProductView } from '@/features/products/schemas';
import { normalizeProducts } from '@/features/products/normalizers';

export default function LandingReady({ products }: { products: Product[] | any[] }) {
  const ready = useMemo(
    () => products.filter((p: any) => p.prontaEntrega || p.sizes?.some((s: any) => s.prontaEntrega)),
    [products]
  );

  if (ready.length === 0) return null;

  const normalized: ProductView[] = useMemo(() => normalizeProducts(ready), [ready]);

  return (
    <section id="pronta-entrega" className="py-20 md:py-32">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Peças a Pronta Entrega</h2>
          <p className="mt-2 text-gray-400">Obras exclusivas disponíveis para envio imediato. Estoque limitado.</p>
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

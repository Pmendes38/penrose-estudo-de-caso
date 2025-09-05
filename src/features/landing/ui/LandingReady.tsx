import ProductCard from '@/components/Product/ProductCard';
import type { Product } from '@/lib/types';

export default function LandingReady({ products }: { products: Product[] }) {
  const ready = products.filter(
    (p) => p.prontaEntrega || p.sizes?.some((s) => s.prontaEntrega)
  );
  if (ready.length === 0) return null;

  return (
    <section id="pronta-entrega" className="py-20 md:py-32">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Peças a Pronta Entrega</h2>
          <p className="mt-2 text-gray-400">Obras exclusivas disponíveis para envio imediato. Estoque limitado.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {ready.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

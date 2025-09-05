// src/features/products/ui/ProductCard.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import OptimizedImage from '@/shared/ui/optimized-image/index';
import Button from '@/shared/ui/button';
import { formatBRL } from '@/shared/lib/format';
import { useCart } from '@/shared/context/CartContext';
import type { ProductView } from '@/features/products/schemas';

type Size = { name?: string; label?: string; price: number };

export default function ProductCard({ product }: { product: ProductView }) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const { addItem } = useCart();

  const lowest = product.sizes?.length ? Math.min(...product.sizes.map((s: Size) => s.price)) : (product.price ?? 0);
  const highest = product.sizes?.length ? Math.max(...product.sizes.map((s: Size) => s.price)) : lowest;
  const multi = product.sizes && product.sizes.length > 1 && lowest !== highest;

  const handleAddToCart = () => {
    if (product.sizes?.length && !selectedSize) {
      setShowSizeSelector(true);
      return;
    }
    const sizeData = product.sizes?.find((s: Size) => (s.label || s.name) === selectedSize);
    const price = sizeData?.price ?? lowest;

    addItem({
      productId: product.id,
      name: product.name,
      price,
      quantity: 1,
      images: product.images,
      image: product.images?.[0],
      variantKey: selectedSize || null,
      meta: { selectedSize },
    });

    setSelectedSize('');
    setShowSizeSelector(false);
  };

  return (
    <article className="relative bg-brand-gray-dark rounded-2xl shadow-soft overflow-hidden hover:shadow-hard transition-all duration-300 hover:-translate-y-2 border border-brand-gray-border/50 hover:border-brand-blue/30">
      <Link href={`/produto/${product.id}`} className="block relative">
        <div className="relative overflow-hidden">
          <OptimizedImage
            src={product.images?.[0] || '/assets/placeholder-product.jpg'}
            alt={`Action Figure ${product.name}`}
            width={400}
            height={300}
            className="w-full h-64 object-cover object-top transition-transform duration-500 hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-brand-black/20 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity" />
        </div>
      </Link>

      <div className="p-6">
        <Link href={`/produto/${product.id}`} className="block mb-4">
          <h3 className="text-lg font-semibold text-brand-gray-light mb-2 hover:text-brand-blue transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {!!product.tags?.length && (
          <div className="flex flex-wrap gap-2 mb-4">
            {product.tags.slice(0, 3).map((tag, i) => (
              <span key={tag + i} className="px-3 py-1 bg-brand-gray-border/30 text-brand-gray text-xs rounded-full border border-brand-gray-border">
                {tag}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span className="px-3 py-1 bg-brand-gray-border/20 text-brand-gray text-xs rounded-full">
                +{product.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="mb-6">
          {multi ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-brand-blue">{formatBRL(lowest)}</span>
                <span className="text-sm text-brand-gray">até {formatBRL(highest)}</span>
              </div>
              <span className="text-xs text-brand-gray">Varia por tamanho</span>
            </div>
          ) : (
            <span className="text-2xl font-bold text-brand-blue">{formatBRL(lowest)}</span>
          )}
        </div>

        {!!product.sizes?.length && (
          <div className="mb-6">
            <fieldset>
              <legend className="text-sm font-medium text-brand-gray-light mb-3">
                Tamanhos disponíveis: {selectedSize && <span className="text-brand-blue font-semibold ml-2">{selectedSize}</span>}
              </legend>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => {
                  const label = s.label || s.name || '';
                  const selected = selectedSize === label;
                  return (
                    <button
                      key={label}
                      onClick={() => setSelectedSize(label)}
                      className={`px-4 py-2.5 text-sm border rounded-lg transition-all ${
                        selected
                          ? 'border-brand-blue bg-brand-blue/20 text-brand-blue shadow-glow'
                          : 'border-brand-gray-border text-brand-gray hover:border-brand-blue/50 hover:bg-brand-gray-border/20'
                      }`}
                      aria-pressed={selected}
                      aria-label={`Tamanho ${label} - ${formatBRL(s.price)}`}
                    >
                      <div className="text-center font-medium">{label}</div>
                    </button>
                  );
                })}
              </div>
              {showSizeSelector && !selectedSize && (
                <p className="mt-2 text-xs text-brand-error">Selecione um tamanho para continuar.</p>
              )}
            </fieldset>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={handleAddToCart}
            disabled={!!product.sizes?.length && !selectedSize}
            variant="primary"
            size="md"
            fullWidth
          >
            {product.sizes?.length && !selectedSize ? 'Selecione um tamanho' : 'Adicionar ao Carrinho'}
          </Button>

          <Link href={`/produto/${product.id}`} className="block">
            <Button variant="outline" size="md" fullWidth>
              Ver Detalhes
            </Button>
          </Link>
        </div>
      </div>

      <div className="absolute top-3 left-3 flex flex-col gap-2">
        {product.isNew && (
          <span className="px-3 py-1.5 bg-gradient-to-r from-brand-success to-green-600 text-white text-xs font-semibold rounded-full shadow-medium">
            ✨ Novo
          </span>
        )}
        {product.prontaEntrega && (
          <span className="px-3 py-1.5 bg-gradient-to-r from-brand-warning to-yellow-600 text-white text-xs font-semibold rounded-full shadow-medium">
            🚀 Pronta Entrega
          </span>
        )}
      </div>

      <div className="absolute top-3 right-3">
        {typeof product.discount === 'number' && (
          <span className="px-3 py-1.5 bg-gradient-to-r from-brand-error to-red-600 text-white text-xs font-semibold rounded-full shadow-medium">
            -{product.discount}% OFF
          </span>
        )}
      </div>
    </article>
  );
}

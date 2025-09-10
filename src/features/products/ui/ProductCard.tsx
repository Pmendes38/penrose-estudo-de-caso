// src/features/products/ui/ProductCard.tsx
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import OptimizedImage from '@/shared/ui/optimized-image';
import Button from '@/shared/ui/button';
import { formatBRL } from '@/shared/lib/format';
import { useCart } from '@/features/cart/hooks/useCart';
import type { ProductView } from '@/features/products/normalizers';
import { useToast } from '@/shared/ui/use-toast';

export default function ProductCard({ product }: { product: ProductView }) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [adding, setAdding] = useState(false);

  // novo hook do carrinho (conectado ao backend)
  const { add } = useCart();
  const { toast } = useToast();

  // Preço exibido (apenas UI). O backend define o preço final no add().
  const { lowest, highest, multi } = useMemo(() => {
    if (product.sizes?.length) {
      const values = product.sizes.map((s) => s.priceBRL);
      const lo = Math.min(...values);
      const hi = Math.max(...values);
      return { lowest: lo, highest: hi, multi: product.sizes.length > 1 && lo !== hi };
    }
    return { lowest: product.priceBRL, highest: product.priceBRL, multi: false };
  }, [product.sizes, product.priceBRL]);

  const handleAddToCart = async () => {
    if (product.sizes?.length && !selectedSize) {
      setShowSizeSelector(true);
      return;
    }

    const sizeData = product.sizes?.find((s) => (s.label || s.name) === selectedSize);
    // sku de preferência por variação; fallback para sku do produto; por último id.
    const sku =
      (sizeData as any)?.sku ||
      (product as any)?.sku ||
      String(product.id);

    setAdding(true);
    try {
      await add({
        sku,
        quantity: 1,
        // envie metadados da variação (o backend usa para mesclar itens iguais)
        variant: selectedSize ? { size: selectedSize } : undefined,
        // opcionais (se seu catálogo trouxer):
        // weightGrams: product.weightGrams ?? undefined,
        // dimensions: product.dimensions ?? undefined,
      });

      toast({
        title: 'Adicionado ao carrinho',
        description: `${product.name}${selectedSize ? ` • ${selectedSize}` : ''}`,
      });

      setSelectedSize('');
      setShowSizeSelector(false);
    } catch (e: any) {
      toast({
        title: 'Não foi possível adicionar',
        description: e?.message || 'Tente novamente em instantes.',
        variant: 'destructive',
      });
    } finally {
      setAdding(false);
    }
  };

  const productHref = `/product/${encodeURIComponent((product as any).slug ?? product.id)}`;

  return (
    <article className="relative bg-brand-gray-dark rounded-2xl shadow-soft overflow-hidden hover:shadow-hard transition-all duration-300 hover:-translate-y-2 border border-brand-gray-border/50 hover:border-brand-blue/30">
      <Link href={productHref} className="block relative">
        <div className="relative overflow-hidden">
          <OptimizedImage
            src={product.image || '/assets/placeholder-product.jpg'}
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
        <Link href={productHref} className="block mb-4">
          <h3 className="text-lg font-semibold text-brand-gray-light mb-2 hover:text-brand-blue transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {!!product.tags?.length && (
          <div className="flex flex-wrap gap-2 mb-4">
            {product.tags.slice(0, 3).map((tag, i) => (
              <span
                key={tag + i}
                className="px-3 py-1 bg-brand-gray-border/30 text-brand-gray text-xs rounded-full border border-brand-gray-border"
              >
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
                  const isSelected = selectedSize === label;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        setSelectedSize(label);
                        setShowSizeSelector(false);
                      }}
                      className={`px-4 py-2.5 text-sm border rounded-lg transition-all ${
                        isSelected
                          ? 'border-brand-blue bg-brand-blue/20 text-brand-blue shadow-glow'
                          : 'border-brand-gray-border text-brand-gray hover:border-brand-blue/50 hover:bg-brand-gray-border/20'
                      }`}
                      aria-pressed={isSelected}
                      aria-label={`Tamanho ${label} - ${formatBRL(s.priceBRL)}`}
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
            disabled={adding || (!!product.sizes?.length && !selectedSize)}
            variant="primary"
            size="md"
            fullWidth
          >
            {adding
              ? 'Adicionando…'
              : product.sizes?.length && !selectedSize
              ? 'Selecione um tamanho'
              : 'Adicionar ao Carrinho'}
          </Button>

          <Link href={productHref} className="block">
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

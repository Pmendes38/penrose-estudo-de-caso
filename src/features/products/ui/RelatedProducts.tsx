'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { formatBRL } from '@/shared/lib/format';

type Size = { price: number; label?: string; name?: string };
type P = {
  id: string;
  name: string;
  price?: number;
  images?: string[];
  mainImage?: string;
  category?: string;
  tags?: string[] | string;
  sizes?: Size[];
  isNew?: boolean;
  discount?: number;
};
type Props = {
  currentProduct: P;
  allProducts: P[];
  onProductClick: (p: P) => void;
};

export default function RelatedProducts({ currentProduct, allProducts, onProductClick }: Props) {
  const relatedProducts = useMemo(() => {
    if (!currentProduct || !allProducts?.length) return [];

    const normalizeTags = (t?: string[] | string) =>
      Array.isArray(t) ? t : typeof t === 'string' ? t.split(/[,\s]+/).filter(Boolean) : [];

    const currentTags = normalizeTags(currentProduct.tags);
    const byTags = allProducts
      .filter(p => p.id !== currentProduct.id)
      .filter(p => {
        const tags = normalizeTags(p.tags);
        return tags.length && currentTags.length && tags.some(tag => currentTags.includes(tag));
      })
      .slice(0, 4);

    if (byTags.length) return byTags;

    const sameCategory = allProducts
      .filter(p => p.id !== currentProduct.id && p.category === currentProduct.category)
      .slice(0, 4);

    return sameCategory;
  }, [currentProduct, allProducts]);

  if (!relatedProducts.length) return null;

  const lowestPriceOf = (p: P) => {
    if (p.sizes?.length) return Math.min(...p.sizes.map(s => s.price));
    return p.price ?? 0;
    };

  return (
    <section className="border-t border-gray-700 pt-6 mt-6" aria-labelledby="related-title">
      <h3 id="related-title" className="text-2xl font-bold text-white mb-6">
        Produtos Relacionados
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map(p => {
          const img = p.images?.[0] ?? p.mainImage ?? 'https://placehold.co/400x400/374151/9CA3AF?text=Produto';
          return (
            <article
              key={p.id}
              className="bg-gray-800/50 rounded-lg overflow-hidden hover:bg-gray-800/70 transition-colors group"
            >
              <button
                onClick={() => onProductClick(p)}
                className="text-left w-full"
                aria-label={`Abrir modal do produto ${p.name}`}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={img}
                    alt={p.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e: any) =>
                      (e.currentTarget.src = 'https://placehold.co/400x400/374151/9CA3AF?text=Imagem')
                    }
                  />
                  {p.isNew && (
                    <span className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                      Novo
                    </span>
                  )}
                  {typeof p.discount === 'number' && (
                    <span className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                      -{p.discount}%
                    </span>
                  )}
                </div>

                <div className="p-4">
                  {p.category && <span className="text-sm font-semibold text-orange-400 block mb-1">{p.category}</span>}
                  <h4 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-orange-400 transition-colors">
                    {p.name}
                  </h4>

                  <div className="mb-3">
                    <span className="text-lg font-bold text-white">{formatBRL(lowestPriceOf(p))}</span>
                    {p.sizes?.length! > 1 && <span className="text-sm text-gray-400 ml-1">a partir de</span>}
                  </div>

                  {Array.isArray(p.tags) && p.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {p.tags.slice(0, 2).map((tag, i) => (
                        <span key={tag + i} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onProductClick(p);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-md text-sm"
                    >
                      Ver Detalhes
                    </button>
                    <Link
                      href={`/product/${p.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-3 rounded-md text-sm"
                    >
                      Abrir
                    </Link>
                  </div>
                </div>
              </button>
            </article>
          );
        })}
      </div>

      <div className="text-center mt-8">
        <Link
          href="/produtos"
          className="inline-flex items-center px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg"
        >
          Ver Todos os Produtos
          <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </section>
  );
}

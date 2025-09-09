'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/features/products/schemas';
import { formatBRL } from '@/shared/lib/format';

function coverOf(p: any): string {
  return (
    p?.images?.[0] ||
    p?.imageUrl ||
    p?.image ||
    p?.thumbnail ||
    '/assets/placeholder.jpg'
  );
}

function priceCentsOf(p: any): number {
  if (typeof p?.priceCents === 'number') return p.priceCents;
  if (typeof p?.price?.cents === 'number') return p.price.cents;
  if (typeof p?.price === 'number') return p.price; // já em centavos
  return 0;
}

function linkTo(p: any): string {
  const idOrSlug = p?.slug ?? p?.id ?? '';
  return `/products/${encodeURIComponent(String(idOrSlug))}`;
}

export default function CatalogGrid({ products }: { products: Product[] }) {
  if (!products?.length) {
    return (
      <div className="rounded-lg border border-brand-gray-border bg-brand-gray-dark p-12 text-center">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-xl font-semibold text-brand-gray-light mb-2">
          Nenhum produto disponível
        </h3>
        <p className="text-brand-gray">Tente ajustar os filtros ou volte mais tarde.</p>
      </div>
    );
  }

  return (
    <section
      aria-label="Lista de produtos"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {products.map((p) => {
        const cover = coverOf(p);
        const cents = priceCentsOf(p);

        return (
          <article
            key={p.id}
            className="bg-brand-gray-dark rounded-lg border border-brand-gray-border overflow-hidden flex flex-col"
          >
            <Link href={linkTo(p)} className="block relative aspect-square bg-black/30">
              <Image
                src={cover}
                alt={p.name ?? 'Produto'}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
                priority={false}
              />
            </Link>

            <div className="p-4 flex-1 flex flex-col">
              <h3 className="text-white font-semibold line-clamp-2">{p.name}</h3>
              {p.tags?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {p.tags.slice(0, 3).map((t: string) => (
                    <span
                      key={t}
                      className="text-xs px-2 py-1 rounded bg-brand-gray text-brand-gray-light border border-brand-gray-border"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 text-brand-blue font-bold text-lg">
                {formatBRL(cents / 100)}
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  className="flex-1 bg-brand-blue hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                  onClick={() => {
                    alert('Adicionar ao carrinho ainda não implementado.');
                  }}
                >
                  Adicionar ao Carrinho
                </button>

                <Link
                  href={linkTo(p)}
                  className="px-4 py-2 rounded border border-brand-gray-border text-brand-gray-light hover:text-white hover:border-brand-blue"
                >
                  Ver Detalhes
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}

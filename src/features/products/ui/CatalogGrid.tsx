'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/features/products/schemas';
import { formatBRL } from '@/shared/lib/format';
import { useCart } from '@/features/cart/hooks/useCart'; 
import { useState } from 'react';

function coverOf(p: any): string {
  return p?.images?.[0] || p?.imageUrl || p?.image || p?.thumbnail || '/assets/placeholder.jpg';
}

function priceCentsOf(p: any): number {
  if (typeof p?.priceCents === 'number') return p.priceCents;
  if (typeof p?.price?.cents === 'number') return p.price.cents;
  if (typeof p?.price === 'number') return p.price;
  return 0;
}

function linkTo(p: any): string {
  const idOrSlug = p?.slug ?? p?.id ?? '';
  return `/product/${encodeURIComponent(String(idOrSlug))}`;
}

function skuOf(p: any): string {
  return String(p?.sku ?? p?.id ?? '');
}
function defaultVariantOf(p: any): Record<string, string> | undefined {
  const sizes = Array.isArray(p?.sizes) ? p.sizes : null;
  if (!sizes?.length) return undefined;
  const chosen = sizes.find((s: any) => s?.inStock) ?? sizes[0];
  return chosen?.name ? { size: String(chosen.name) } : undefined;
}
function inStock(p: any): boolean {
  const stockOk = typeof p?.stock === 'number' ? p.stock > 0 : true;
  return (p?.status ?? 'active') === 'active' && stockOk;
}

export default function CatalogGrid({ products }: { products: Product[] }) {
  const { add } = useCart(); // ⬅️ novo
  const [pendingId, setPendingId] = useState<string | null>(null); // ⬅️ novo
  const [addedId, setAddedId] = useState<string | null>(null); // ⬅️ novo

  if (!products?.length) {
    return (
      <div className="rounded-lg border border-brand-gray-border bg-brand-gray-dark p-12 text-center">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-xl font-semibold text-brand-gray-light mb-2">Nenhum produto disponível</h3>
        <p className="text-brand-gray">Tente ajustar os filtros ou volte mais tarde.</p>
      </div>
    );
  }

  async function handleAdd(p: any) {
    setPendingId(p.id);
    try {
      await add({
        sku: skuOf(p),
        quantity: 1,
        variant: defaultVariantOf(p), // ex.: { size: 'M' }
      });
      setAddedId(p.id);
      setTimeout(() => setAddedId(null), 1400);
    } catch (e) {
      alert('Não foi possível adicionar ao carrinho. Tente novamente.');
      console.error(e);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <section aria-label="Lista de produtos" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((p) => {
        const cover = coverOf(p);
        const cents = priceCentsOf(p);
        const disabled = !inStock(p) || pendingId === p.id;

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

              <div className="mt-4 text-brand-blue font-bold text-lg">{formatBRL(cents / 100)}</div>

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  className="flex-1 bg-brand-blue hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-60"
                  onClick={() => handleAdd(p)}
                  disabled={disabled}
                >
                  {pendingId === p.id && 'Adicionando…'}
                  {addedId === p.id && 'Adicionado ✓'}
                  {pendingId !== p.id && addedId !== p.id && 'Adicionar ao Carrinho'}
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

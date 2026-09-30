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
      <div className="penrose-empty-state">
        <h3>Nenhum produto disponível</h3><p>Tente ajustar os filtros ou volte mais tarde.</p>
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
    <section aria-label="Lista de produtos" className="penrose-catalog-grid">
      {products.map((p) => {
        const cover = coverOf(p);
        const cents = priceCentsOf(p);
        const disabled = !inStock(p) || pendingId === p.id;

        return (
          <article
            key={p.id}
            className="penrose-store-card"
          >
            <Link href={linkTo(p)} className="penrose-store-card-image">
              <Image
                src={cover}
                alt={p.name ?? 'Produto'}
                fill
                sizes="(min-width: 1200px) 18vw, (min-width: 640px) 32vw, 100vw"
                className="object-cover"
                priority={false}
              />
            </Link>

            <div className="penrose-store-card-copy">
              <span className="penrose-card-kicker">COLECIONÁVEL</span><h3>{p.name}</h3>
              {p.tags?.length > 0 && (
                <div className="penrose-card-tags">
                  {p.tags.slice(0, 3).map((t: string) => (
                    <span
                      key={t}
                      className="penrose-card-tag"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <div className="penrose-card-price">{formatBRL(cents / 100)}</div>

              <div className="penrose-card-actions">
                <button
                  type="button"
                  className="penrose-card-cart"
                  onClick={() => handleAdd(p)}
                  disabled={disabled}
                >
                  {pendingId === p.id && 'Adicionando…'}
                  {addedId === p.id && 'Adicionado ✓'}
                  {pendingId !== p.id && addedId !== p.id && 'Adicionar ao Carrinho'}
                </button>

                <Link
                  href={linkTo(p)}
                  className="penrose-card-details"
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

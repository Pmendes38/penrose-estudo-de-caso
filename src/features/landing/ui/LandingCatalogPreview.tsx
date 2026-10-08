'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { CatalogProduct } from '@/features/products/catalog';

export default function LandingCatalogPreview({ filters, products }: { filters: readonly string[]; products: CatalogProduct[] }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Todos');
  const visible = useMemo(() => products.filter((product) => {
    const text = `${product.name} ${product.category ?? ''} ${product.tags.join(' ')} ${product.description ?? ''}`.toLowerCase();
    const category = filter === 'Todos' || text.includes(filter.toLowerCase()) || (filter === 'Universo DC' && product.category === 'Universo DC') || (filter === 'Universo Marvel' && product.category === 'Marvel');
    return category && text.includes(query.trim().toLowerCase());
  }), [products, filter, query]);

  return <>
    <input value={query} onChange={(event) => setQuery(event.target.value)} className="penrose-search-field" placeholder="Pesquisar por nome ou tag..." aria-label="Pesquisar produtos" />
    <div className="penrose-filter-row" aria-label="Filtrar catálogo por categoria">
      {filters.map((option) => <button type="button" className={filter === option ? 'is-active' : ''} onClick={() => setFilter(option)} key={option}>{option}</button>)}
    </div>
    <Link href="/catalog" className="penrose-collections-more penrose-catalog-see-all">Ver tudo</Link>
    <div className="penrose-product-viewport"><div className="penrose-product-gallery" aria-label="Prévia do catálogo">
      {visible.map((product) => <article className="penrose-product-card" key={product.id}>
        <Link href={`/product/${product.id}`} className="penrose-product-image">{product.images[0] ? <Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 768px) 46vw, 340px" /> : <span>Foto em breve</span>}</Link>
        <div className="penrose-product-copy"><span>{product.category ?? 'CATÁLOGO'}</span><h3>{product.name}</h3><p>{product.tags[0] ?? product.category ?? ''}</p><p className="penrose-product-description-preview">{product.description ?? ''}</p><Link href={`/product/${product.id}`}>Detalhes</Link></div>
      </article>)}
    </div></div>
    {!visible.length && <p role="status">Nenhum produto encontrado. Tente outra busca ou categoria.</p>}
  </>;
}

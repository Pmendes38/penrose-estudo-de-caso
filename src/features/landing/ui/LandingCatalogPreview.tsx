'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';

type Product = { id: string; name: string; universe: string; image: string; description: string };

export default function LandingCatalogPreview({ products, filters }: { products: Product[]; filters: readonly string[] }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Todos');
  const visible = useMemo(() => products.filter((product) => {
    const text = `${product.name} ${product.universe} ${product.description}`.toLowerCase();
    return (filter === 'Todos' || filter === 'Anime') && text.includes(query.trim().toLowerCase());
  }), [filter, products, query]);

  return <>
    <input value={query} onChange={(event) => setQuery(event.target.value)} className="penrose-search-field" placeholder="Pesquisar por nome ou tag..." aria-label="Pesquisar produtos" />
    <div className="penrose-filter-row" aria-label="Filtrar catálogo por categoria">
      {filters.map((option) => <button type="button" className={filter === option ? 'is-active' : ''} onClick={() => setFilter(option)} key={option}>{option}</button>)}
    </div>
    <div className="penrose-product-viewport"><div className="penrose-product-gallery" aria-label="Prévia do catálogo">
      {visible.map((product) => <article className="penrose-product-card" key={product.id}>
        <Link href={`/product/${product.id}`} className="penrose-product-image"><Image src={product.image} alt={product.name} fill sizes="(max-width: 768px) 46vw, 340px" /></Link>
        <div className="penrose-product-copy"><span>ANIME</span><h3>{product.name}</h3><p>{product.universe}</p><p className="penrose-product-description-preview">{product.description}</p><Link href={`/product/${product.id}`}>Detalhes</Link></div>
      </article>)}
    </div></div>
    <Link href="/catalog" className="penrose-collections-more penrose-catalog-see-all">Ver tudo</Link>
  </>;
}

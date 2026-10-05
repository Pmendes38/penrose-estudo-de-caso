import Link from 'next/link';
import CatalogGrid from '@/features/products/ui/CatalogGrid';
import { catalogProducts, productPrice } from '@/features/products/catalog';

type SearchParams = { search?: string; category?: string | string[]; minPrice?: string; maxPrice?: string; discount?: string; page?: string };

export default function CatalogPage({ searchParams = {} }: { searchParams?: SearchParams }) {
  const categories = [searchParams.category].flat().filter((value): value is string => Boolean(value));
  const search = (searchParams.search ?? '').trim().toLocaleLowerCase('pt-BR');
  const min = Number(searchParams.minPrice) || 0;
  const max = Number(searchParams.maxPrice) || Infinity;
  const discount = Number(searchParams.discount) || 0;
  const filtered = catalogProducts.filter((product) => {
    const price = productPrice(product).cents / 100;
    const percent = product.regularPriceCents && product.salePriceCents
      ? Math.round((1 - product.salePriceCents / product.regularPriceCents) * 100) : 0;
    return (!categories.length || categories.includes(product.category)) &&
      (!search || `${product.name} ${product.description} ${product.sourceCategory ?? ''} ${product.sku}`.toLocaleLowerCase('pt-BR').includes(search)) &&
      price >= min && price <= max && percent >= discount;
  });
  const pages = Math.max(1, Math.ceil(filtered.length / 8));
  const page = Math.min(pages, Math.max(1, Number(searchParams.page) || 1));
  const pageUrl = (number: number) => {
    const query = new URLSearchParams();
    if (searchParams.search) query.set('search', searchParams.search);
    categories.forEach((category) => query.append('category', category));
    if (searchParams.minPrice) query.set('minPrice', searchParams.minPrice);
    if (searchParams.maxPrice) query.set('maxPrice', searchParams.maxPrice);
    if (searchParams.discount) query.set('discount', searchParams.discount);
    query.set('page', String(number));
    return `/catalog?${query}`;
  };

  return <div className="penrose-page penrose-catalog-page">
    <aside className="penrose-filter-panel">
      <form action="/catalog" className="penrose-filter-form">
        <label className="penrose-filter-search">Buscar produto<input name="search" defaultValue={searchParams.search ?? ''} placeholder="Nome ou personagem" /></label>
        <h2>Filtros</h2>
        <fieldset><legend>Coleções</legend>
          {['Anime', 'Marvel', 'Universo DC', 'Games', 'Outros'].map((category) =>
            <label className="filter-check" key={category}><input type="checkbox" name="category" value={category} defaultChecked={categories.includes(category)} />{category}</label>)}
        </fieldset>
        <fieldset><legend>Preço</legend><div className="filter-price"><input name="minPrice" inputMode="decimal" defaultValue={searchParams.minPrice} placeholder="Mínimo" aria-label="Preço mínimo" /><input name="maxPrice" inputMode="decimal" defaultValue={searchParams.maxPrice} placeholder="Máximo" aria-label="Preço máximo" /></div></fieldset>
        <fieldset><legend>Desconto</legend>
          <label className="filter-check"><input type="radio" name="discount" value="0" defaultChecked={!discount} />Todos</label>
          {[10, 25, 50].map((value) => <label className="filter-check" key={value}><input type="radio" name="discount" value={value} defaultChecked={discount === value} />{value}% OFF ou mais</label>)}
        </fieldset>
        <button type="submit">Aplicar filtros</button>
        <Link href="/catalog" className="penrose-clear-filters">Limpar filtros</Link>
      </form>
    </aside>
    <div className="penrose-catalog-results">
      <header><div><nav aria-label="Caminho"><Link href="/">Home</Link> / Coleção</nav><h1>COLEÇÃO</h1></div><span>{filtered.length} produtos</span></header>
      <CatalogGrid products={filtered.slice((page - 1) * 8, page * 8)} />
      {pages > 1 && <nav className="penrose-pagination" aria-label="Páginas do catálogo">
        {page > 1 && <Link href={pageUrl(page - 1)} aria-label="Página anterior">‹</Link>}
        {Array.from({ length: pages }, (_, index) => index + 1).filter((number) => number === 1 || number === pages || Math.abs(number - page) <= 1).map((number) =>
          <Link key={number} href={pageUrl(number)} aria-current={number === page ? 'page' : undefined}>{number}</Link>)}
        {page < pages && <Link href={pageUrl(page + 1)} aria-label="Próxima página">›</Link>}
      </nav>}
    </div>
  </div>;
}

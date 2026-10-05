import { fetchPublicProducts } from '@/features/products/api';
import CatalogGrid from '@/features/products/ui/CatalogGrid';
import type { Product } from '@/features/products/schemas';

type SearchParams = Partial<{
  search: string;
  category: string;
  status: 'active' | 'inactive';
  minPrice: string | number;
  maxPrice: string | number;
  page: string | number;
  pageSize: string | number;
  sortBy: 'priceCents' | 'createdAt' | 'name';
  sortDir: 'asc' | 'desc';
}>;

export default async function CatalogPage({ searchParams }: { searchParams?: SearchParams }) {
  const q = {
    search: searchParams?.search,
    category: searchParams?.category,
    status: searchParams?.status,
    minPrice:
      typeof searchParams?.minPrice === 'string'
        ? Number(searchParams?.minPrice)
        : (searchParams?.minPrice as number | undefined),
    maxPrice:
      typeof searchParams?.maxPrice === 'string'
        ? Number(searchParams?.maxPrice)
        : (searchParams?.maxPrice as number | undefined),
    page:
      typeof searchParams?.page === 'string'
        ? Number(searchParams?.page)
        : (searchParams?.page as number | undefined),
    pageSize:
      typeof searchParams?.pageSize === 'string'
        ? Number(searchParams?.pageSize)
        : (searchParams?.pageSize as number | undefined),
    sortBy: searchParams?.sortBy,
    sortDir: searchParams?.sortDir,
  };

  const fallback: Product[] = [
    ['Portgas D. Ace','One Piece',45900,'/assets/penrose/product-1.png'],
    ['Adult Gon','Hunter x Hunter',31900,'/assets/penrose/product-2.png'],
    ['Alphonse','Fullmetal Alchemist',25900,'/assets/penrose/product-3.png'],
    ['Gaara','Naruto',35900,'/assets/penrose/product-4.png'],
    ['Wolverine','Universo Marvel',54900,'/assets/penrose/product-7.png'],
    ['Aquaman','Universo DC',48900,'/assets/penrose/product-aquaman.jpg'],
    ['Asa Noturna','Universo DC',89000,'/assets/penrose/product-8.png'],
    ['Vampira','Universo Marvel',45900,'/assets/penrose/product-6.png'],
  ].map(([name,category,price,image],index)=>({id:`visual-${index+1}`,slug:`visual-${index+1}`,name:String(name),category:String(category),priceCents:Number(price),stock:1,status:'active' as const,description:'Peça colecionável com acabamento manual.',images:[String(image)],tags:[String(category)]}));

  const page = await fetchPublicProducts({
    ...q,
    page: q.page ?? 1,
    pageSize: q.pageSize ?? 12,
  }).catch(() => ({items:fallback,total:fallback.length,page:1,pageSize:fallback.length,pages:1}));

  return (
    <div className="penrose-page penrose-catalog-page">
      <aside className="penrose-filter-panel">
        <h1>FILTROS</h1>
        <form action="/catalog" className="penrose-filter-form">
          <label>O que você procura?<input name="search" defaultValue={String(q.search ?? '')} placeholder="Pesquise por produto..." /></label>
          <fieldset><legend>Categorias</legend>{['Anime','Games','Filmes','Séries'].map((item) => <label className="filter-check" key={item}><input type="radio" name="category" value={item} defaultChecked={q.category === item}/><span>{item}</span></label>)}</fieldset>
          <fieldset><legend>Faixa de preço</legend><div className="filter-price"><input name="minPrice" inputMode="numeric" defaultValue={q.minPrice} placeholder="Mínimo"/><input name="maxPrice" inputMode="numeric" defaultValue={q.maxPrice} placeholder="Máximo"/></div></fieldset>
          <label>Ordenar por<select name="sortBy" defaultValue={q.sortBy ?? 'createdAt'}><option value="createdAt">Mais recentes</option><option value="name">Nome</option><option value="priceCents">Preço</option></select></label>
          <button type="submit">APLICAR FILTROS</button>
        </form>
      </aside>
      <section className="penrose-catalog-results">
        <header><div><p>CATÁLOGO COMPLETO</p><h2>{page.total} PRODUTOS</h2></div><span>Peças exclusivas para colecionadores</span></header>
        <CatalogGrid products={page.items} />

        {page.pages > 1 && (
          <nav className="penrose-pagination">
            <a
              href={`?page=${Math.max(1, (q.page ?? 1) - 1)}&pageSize=${q.pageSize ?? 12}&search=${encodeURIComponent(
                String(q.search ?? ''),
              )}`}
              className="penrose-page-button"
            >
              ◀ Anterior
            </a>
            <span>
              Página {q.page ?? 1} de {page.pages}
            </span>
            <a
              href={`?page=${Math.min(page.pages, (q.page ?? 1) + 1)}&pageSize=${q.pageSize ?? 12}&search=${encodeURIComponent(
                String(q.search ?? ''),
              )}`}
              className="penrose-page-button"
            >
              Próxima ▶
            </a>
          </nav>
        )}
      </section>
    </div>
  );
}

import { requireCustomerOrRedirect } from '@/features/auth/server/guards';
import { fetchPublicProducts } from '@/features/products/api';
import CatalogGrid from '@/features/products/ui/CatalogGrid';
import CatalogSearch from '@/features/products/ui/CatalogSearch';

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
  requireCustomerOrRedirect();

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

  const page = await fetchPublicProducts({
    ...q,
    page: q.page ?? 1,
    pageSize: q.pageSize ?? 12,
  });

  return (
    <main className="min-h-screen bg-brand-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Catálogo</h1>
            <p className="text-brand-gray mt-1">
              {page.total > 0
                ? `${page.total} produto${page.total > 1 ? 's' : ''} encontrado${
                    page.total > 1 ? 's' : ''
                  }`
                : 'Nenhum produto encontrado'}
            </p>
          </div>

          <CatalogSearch
            defaultValue={String(q.search ?? '')}
            className="w-full md:w-80"
            placeholder="Buscar por nome, tag…"
          />
        </header>

        <CatalogGrid products={page.items} />

        {page.pages > 1 && (
          <nav className="mt-8 flex items-center justify-center gap-2">
            <a
              href={`?page=${Math.max(1, (q.page ?? 1) - 1)}&pageSize=${q.pageSize ?? 12}&search=${encodeURIComponent(
                String(q.search ?? ''),
              )}`}
              className="px-3 py-2 rounded border border-brand-gray-border text-brand-gray-light hover:text-white hover:border-brand-blue"
            >
              ◀ Anterior
            </a>
            <span className="px-3 py-2 text-brand-gray">
              Página {q.page ?? 1} de {page.pages}
            </span>
            <a
              href={`?page=${Math.min(page.pages, (q.page ?? 1) + 1)}&pageSize=${q.pageSize ?? 12}&search=${encodeURIComponent(
                String(q.search ?? ''),
              )}`}
              className="px-3 py-2 rounded border border-brand-gray-border text-brand-gray-light hover:text-white hover:border-brand-blue"
            >
              Próxima ▶
            </a>
          </nav>
        )}
      </div>
    </main>
  );
}

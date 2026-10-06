import { listAdminProducts } from '@/features/products/api';
import ProductsTable from './table';

export const dynamic = 'force-dynamic';

export default async function AdminProdutos() {
  const first = await listAdminProducts({ page: 1, pageSize: 100 });
  // ponytail: catálogo carregado para filtros locais; migrar filtros ao backend se o volume crescer.
  const remaining = await Promise.all(Array.from({ length: first.pages - 1 }, (_, index) => listAdminProducts({ page: index + 2, pageSize: 100 })));
  return <ProductsTable products={[...first.items, ...remaining.flatMap(page => page.items)]} />;
}

import { listOrdersAdmin } from '@/features/orders/api';
import { listAdminProducts } from '@/features/products/api';
import Reports from './reports';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const [ordersFirst, productsFirst] = await Promise.all([
    listOrdersAdmin({ page: 1, pageSize: 100 }),
    listAdminProducts({ page: 1, pageSize: 100 }),
  ]);
  // ponytail: painéis locais usam a série completa; mover agregações ao backend se o volume crescer.
  const [ordersRest, productsRest] = await Promise.all([
    Promise.all(Array.from({ length: ordersFirst.pages - 1 }, (_, i) => listOrdersAdmin({ page: i + 2, pageSize: 100 }))),
    Promise.all(Array.from({ length: productsFirst.pages - 1 }, (_, i) => listAdminProducts({ page: i + 2, pageSize: 100 }))),
  ]);
  return <Reports orders={[...ordersFirst.items, ...ordersRest.flatMap(page => page.items)]} products={[...productsFirst.items, ...productsRest.flatMap(page => page.items)]} />;
}

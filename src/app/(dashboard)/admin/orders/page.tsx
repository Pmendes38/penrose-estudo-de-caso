import { listOrdersAdmin } from '@/features/orders/api';
import OrdersTable from './table';

export const dynamic = 'force-dynamic';

export default async function OrdersAdminPage() {
  const first = await listOrdersAdmin({ page: 1, pageSize: 100 });
  // ponytail: filtros locais exigem a lista completa; mover para a API se o volume crescer.
  const remaining = await Promise.all(Array.from({ length: first.pages - 1 }, (_, index) => listOrdersAdmin({ page: index + 2, pageSize: 100 })));
  return <OrdersTable orders={[...first.items, ...remaining.flatMap(page => page.items)]} />;
}

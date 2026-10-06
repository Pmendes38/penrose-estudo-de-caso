import { listAdminCoupons } from '@/features/coupons/api';
import { listOrdersAdmin } from '@/features/orders/api';
import CouponsTable from './coupons-table';

export const dynamic = 'force-dynamic';

export default async function AdminCouponsPage() {
  const [coupons, first] = await Promise.all([listAdminCoupons(), listOrdersAdmin({ page: 1, pageSize: 100 })]);
  const remaining = await Promise.all(Array.from({ length: first.pages - 1 }, (_, i) => listOrdersAdmin({ page: i + 2, pageSize: 100 })));
  return <CouponsTable coupons={coupons} orders={[...first.items, ...remaining.flatMap(page => page.items)]} />;
}

import { requireCustomerOrRedirect } from '@/features/auth/server/guards';
import { getMe as getUserMe } from '@/features/users/api';
import { listMyOrders } from '@/features/orders/api';
import type { PagedOrders } from '@/features/orders/schemas';
import CustomerClient from './page.client';

export default async function CustomerPage() {
  requireCustomerOrRedirect();

  const me = await getUserMe().catch(() => null);

  const empty: PagedOrders = { items: [], total: 0, page: 1, pageSize: 10, pages: 1 };

  const ordersPage: PagedOrders = me
    ? await listMyOrders(me.id, { page: 1, pageSize: 10 }).catch(() => empty)
    : empty;

  return <CustomerClient me={me} ordersPage={ordersPage} />;
}

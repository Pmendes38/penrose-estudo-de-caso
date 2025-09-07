import 'server-only';
import { api } from '@/shared/lib/http';
import { PaginatedPaymentsSchema, type PaginatedPayments } from '../schemas';

type Filters = Partial<{
  status: string;
  billingType: string;
  orderId: string;
  providerPaymentId: string;
}>;

export async function fetchAdminPayments(opts: { page?: number; pageSize?: number; filters?: Filters } = {}): Promise<PaginatedPayments> {
  const { page = 1, pageSize = 20, filters = {} } = opts;
  const search = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.billingType ? { billingType: filters.billingType } : {}),
    ...(filters.orderId ? { orderId: filters.orderId } : {}),
    ...(filters.providerPaymentId ? { providerPaymentId: filters.providerPaymentId } : {}),
  });

  const data = await api(`/api/payments/admin?${search.toString()}`);
  return PaginatedPaymentsSchema.parse(data);
}

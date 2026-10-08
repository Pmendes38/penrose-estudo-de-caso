import 'server-only';
import { listPaymentsAdmin } from '../api';
import {
  type PaginatedPayments,
  PaymentStatus,
  BillingType,
} from '../schemas';

import { z } from 'zod';

type Filters = Partial<{
  status: z.infer<typeof PaymentStatus>;
  billingType: z.infer<typeof BillingType>;
  orderId: string;
  providerPaymentId: string;
}>;

export async function fetchAdminPayments(
  opts: { page?: number; pageSize?: number; filters?: Filters } = {},
): Promise<PaginatedPayments> {
  const { page = 1, pageSize = 20, filters = {} } = opts;

  return listPaymentsAdmin({ page, pageSize, ...filters });
}

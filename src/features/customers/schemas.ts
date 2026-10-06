import { z } from 'zod';

export const CustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  totalOrders: z.number().int().nonnegative(),
  totalSpent: z.number().nonnegative(),
  paidOrders: z.number().int().nonnegative(),
  lastOrder: z.string().datetime().nullable(),
  createdAt: z.string().datetime().nullable(),
});

export type Customer = z.infer<typeof CustomerSchema>;

export const CustomersPageSchema = z.array(CustomerSchema);

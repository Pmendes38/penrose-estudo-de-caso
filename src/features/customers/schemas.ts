import { z } from 'zod';

export const CustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  totalOrders: z.number().int().nonnegative(),
  totalSpent: z.number().nonnegative(),
  lastOrder: z.string().or(z.string().datetime()), // mantém flex
  status: z.enum(['active', 'inactive']).default('active'),
});

export type Customer = z.infer<typeof CustomerSchema>;

export const CustomersPageSchema = z.object({
  items: z.array(CustomerSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  pageSize: z.number().int().positive(),
});
// src/features/customers/schemas.ts
import { z } from 'zod';

export const CustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  totalOrders: z.number().int().nonnegative(),
  totalSpent: z.number().nonnegative(),
  lastOrder: z.coerce.date(), // converte string ISO -> Date automaticamente
  status: z.enum(['active', 'inactive']).default('active'),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export type Customer = z.infer<typeof CustomerSchema>;

export const CustomersPageSchema = z.object({
  items: z.array(CustomerSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  pageSize: z.number().int().positive(),
});

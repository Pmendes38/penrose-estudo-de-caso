import { z } from 'zod';

export const OrderStatus = z.enum([
  'pending',
  'processing',
  'paid',
  'shipped',
  'delivered',
  'canceled',
  'refunded',
]);
export type OrderStatus = z.infer<typeof OrderStatus>;

export const OrderItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  size: z.string().optional(),
});
export type OrderItem = z.infer<typeof OrderItemSchema>;

export const OrderSchema = z.object({
  id: z.string(),
  orderId: z.string().optional(), // alguns backends podem expor ambos; opcional por segurança
  orderNumber: z.number(),
  customerId: z.string(),
  status: OrderStatus,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),

  subtotal: z.number(),
  shippingTotal: z.number(),
  discountTotal: z.number(),
  grandTotal: z.number(),

  couponCode: z.string().optional(),
  notes: z.string().optional(),

  // Em algumas rotas o backend não inclui os itens.
  // .catch([]) garante array vazio se vier undefined/null.
  items: z.array(OrderItemSchema).optional().catch([]),
});
export type Order = z.infer<typeof OrderSchema>;

export const PagedOrdersSchema = z.object({
  items: z.array(OrderSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  pages: z.number(),
});
export type PagedOrders = z.infer<typeof PagedOrdersSchema>;

/**
 * Payloads usados em criação/atualização via Server Actions
 * (alinha 100% com o DTO do backend)
 */
export const CreateOrderPayload = z.object({
  customerId: z.string().uuid(),
  items: z.array(OrderItemSchema).min(1),
  subtotal: z.number().min(0),
  shippingTotal: z.number().min(0),
  discountTotal: z.number().min(0),
  grandTotal: z.number().min(0),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
});
export type CreateOrderPayload = z.infer<typeof CreateOrderPayload>;

export const UpdateOrderStatusPayload = z.object({
  status: OrderStatus,
});
export type UpdateOrderStatusPayload = z.infer<typeof UpdateOrderStatusPayload>;

import { z } from 'zod';

export const BillingType = z.enum(['PIX', 'BOLETO', 'CREDIT_CARD']);
export const PaymentStatus = z.enum(['PENDING','AUTHORIZED','CONFIRMED','CANCELED','REFUNDED','FAILED']);

export const PaymentSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  billingType: BillingType,
  status: PaymentStatus,
  amount: z.number(),
  provider: z.literal('ASAAS').optional(),
  providerPaymentId: z.string().optional(),
  boletoUrl: z.string().optional(),
  identificatorField: z.string().optional(),
  pixPayload: z.string().optional(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
});
export type Payment = z.infer<typeof PaymentSchema>;

export const PaginatedPaymentsSchema = z.object({
  items: z.array(PaymentSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  pages: z.number(),
});
export type PaginatedPayments = z.infer<typeof PaginatedPaymentsSchema>;

export const CartItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
  size: z.string().optional(),
});

export const CreatePaymentSchema = z.object({
  cartItems: z.array(CartItemSchema),
  totalAmount: z.number().min(0),
  billingType: BillingType,
  customerData: z.record(z.string(), z.any()),               // ou um shape mais estrito se preferir
  selectedShipping: z.record(z.string(), z.any()).optional(),
  idempotencyKey: z.string().optional(),
});

// derive o type do scema (em vez de declarar manualmente)
export type CreatePaymentPayload = z.infer<typeof CreatePaymentSchema>;

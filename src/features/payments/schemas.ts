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
  createdAt: z.string().or(z.date()).optional(),
  updatedAt: z.string().or(z.date()).optional(),
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

export type CreatePaymentPayload = {
  cartItems: Array<{ productId: string; name: string; quantity: number; unitPrice: number; size?: string }>;
  totalAmount: number;
  billingType: 'PIX' | 'BOLETO' | 'CREDIT_CARD';
  customerData: Record<string, any>;
  selectedShipping?: Record<string, any>;
  idempotencyKey?: string;
};
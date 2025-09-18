import { z } from 'zod';

export const PrintModeSchema = z.enum(['public', 'private']);
export type PrintMode = z.infer<typeof PrintModeSchema>;

export const CheckoutDraftSchema = z.object({
  id: z.string(),
}).passthrough();
export type CheckoutDraft = z.infer<typeof CheckoutDraftSchema>;

export const PrepareCheckoutResponseSchema = z.object({
  draftId: z.string(),
  draft: CheckoutDraftSchema.optional(), // backend retorna { draftId, draft }
});
export type PrepareCheckoutResponse = z.infer<typeof PrepareCheckoutResponseSchema>;

export const PlaceOrderInputSchema = z.object({
  draftId: z.string(),
  printMode: PrintModeSchema.optional().default('private'),
});
export type PlaceOrderInput = z.infer<typeof PlaceOrderInputSchema>;

export const PlaceOrderResponseSchema = z.object({
  draftId: z.string(),
  orders: z.array(z.string()).default([]),
  print: z.object({ mode: PrintModeSchema, url: z.string().url() }).optional(),
  totals: z.any().optional(),
  shipping: z.any().optional(),
});
export type PlaceOrderResponse = z.infer<typeof PlaceOrderResponseSchema>;

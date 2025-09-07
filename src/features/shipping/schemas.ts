import { z } from 'zod';

export const AddressSchema = z.object({
  postalCode: z.string().min(8).max(9),
});

export const PackageItemSchema = z.object({
  weightKg: z.number().positive(),
  widthCm: z.number().positive(),
  heightCm: z.number().positive(),
  lengthCm: z.number().positive(),
  declaredValue: z.number().min(0).optional(),
});

export const CalculateShippingInputSchema = z.object({
  destination: AddressSchema,
  packages: z.array(PackageItemSchema).min(1),
  cartTotal: z.number().min(0).optional(),
  preferCheapest: z.boolean().optional(),
});
export type CalculateShippingInput = z.infer<typeof CalculateShippingInputSchema>;

export const ShippingCompanySchema = z.object({
  name: z.string(),
  code: z.string().optional(),
});

export const ShippingQuoteSchema = z.object({
  id: z.string(),
  name: z.string(),
  company: ShippingCompanySchema,
  priceBRL: z.number(),
  deliveryDays: z.number(),
  description: z.string().optional(),
  etaDate: z.string().optional(),
  isFree: z.boolean().optional(),
});
export type ShippingQuote = z.infer<typeof ShippingQuoteSchema>;

export const ShippingQuoteResponseSchema = z.object({
  source: z.string(), // 'melhor-envio' | 'fallback'
  quotes: z.array(ShippingQuoteSchema),
  bestQuote: ShippingQuoteSchema.nullable(),
});
export type ShippingQuoteResponse = z.infer<typeof ShippingQuoteResponseSchema>;

export const ValidatePostalCodeResponseSchema = z.object({
  valid: z.literal(true),
  normalized: z.string(),
});

export const ShippingServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  company: z.object({ name: z.string() }),
});
export type ShippingService = z.infer<typeof ShippingServiceSchema>;

export const TrackShipmentResponseSchema = z.object({
  trackingCode: z.string(),
  status: z.string(),
  lastUpdate: z.string(),
  history: z.array(z.any()),
});

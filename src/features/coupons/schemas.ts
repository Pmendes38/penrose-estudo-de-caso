// src/features/coupons/schemas.ts
import { z } from 'zod';

export const CouponType = z.enum(['PERCENT','FIXED']);
export type CouponType = z.infer<typeof CouponType>;

export const CouponSchema = z.object({
  id: z.string(),
  code: z.string(),                // UPPERCASE
  description: z.string(),
  type: CouponType,
  value: z.number(),               // PERCENT: 0–100 | FIXED: > 0
  minimumOrderValue: z.number().nullable().optional(),
  maxRedemptions: z.number().nullable().optional(),
  currentRedemptions: z.number().default(0),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  productIds: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default([]),
  active: z.boolean(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});
export type Coupon = z.infer<typeof CouponSchema>;

export const CreateCouponPayload = z.object({
  code: z.string().min(1).transform(s => s.trim().toUpperCase()),
  description: z.string().min(1),
  type: CouponType,
  value: z.number().positive(),
  minimumOrderValue: z.number().min(0).optional(),
  maxRedemptions: z.number().min(1).optional(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  productIds: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  active: z.boolean().optional(),
});
export type CreateCouponPayload = z.infer<typeof CreateCouponPayload>;

export const UpdateCouponPayload = CreateCouponPayload.partial();
export type UpdateCouponPayload = z.infer<typeof UpdateCouponPayload>;

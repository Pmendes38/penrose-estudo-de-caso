import { z } from 'zod';

export const ProductStatusSchema = z.enum(['active', 'inactive']);
export type ProductStatus = z.infer<typeof ProductStatusSchema>;

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  category: z.string().nullable().optional(),
  priceCents: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  status: ProductStatusSchema,
  description: z.string().nullable().optional(),
  images: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  sku: z.string().nullable().optional(),
  createdAt: z.string().datetime().optional().nullable(),
  updatedAt: z.string().datetime().optional().nullable(),
});
export type Product = z.infer<typeof ProductSchema>;

export const ProductPageSchema = z.object({
  items: z.array(ProductSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
  pages: z.number().int(),
});
export type ProductPage = z.infer<typeof ProductPageSchema>;

export const PublicProductEnvelopeSchema = z.object({
  success: z.literal(true),
  source: z.string(),
  product: ProductSchema,
});

export const AdminCreateResponseSchema = z.object({
  message: z.string(),
  product: ProductSchema,
});
export const AdminUpdateResponseSchema = AdminCreateResponseSchema;
export const AdminDeleteResponseSchema = z.object({ message: z.string() });

export const ProductQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  status: ProductStatusSchema.optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).default(20),
  sortBy: z.enum(['priceCents', 'createdAt', 'name']).default('createdAt'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
});
export type ProductQuery = z.infer<typeof ProductQuerySchema>;

export const AdminProductPageSchema = ProductPageSchema;
export type AdminProductPage = z.infer<typeof AdminProductPageSchema>;

export const CreateProductDtoSchema = z.object({
  name: z.string().min(1),
  category: z.string().optional(),
  priceCents: z.number().nonnegative(),
  stock: z.number().int().nonnegative().optional(),
  status: ProductStatusSchema.optional(),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  sku: z.string().regex(/^[A-Z0-9-_.]+$/i).optional(),
});
export type CreateProductDto = z.infer<typeof CreateProductDtoSchema>;

export const UpdateProductDtoSchema = CreateProductDtoSchema.partial();
export type UpdateProductDto = z.infer<typeof UpdateProductDtoSchema>;

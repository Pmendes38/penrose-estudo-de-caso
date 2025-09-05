import { z } from 'zod';

export const productCreateSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  category: z.string().min(2, 'Categoria obrigatória'),
  price: z.coerce.number().nonnegative('Preço inválido'),
  stock: z.coerce.number().int().nonnegative('Estoque inválido').default(0),
  status: z.enum(['active', 'inactive']).default('active'),
  description: z.string().optional().default(''),
  images: z.array(z.string().url('URL inválida')).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
});
export type ProductCreateInput = z.infer<typeof productCreateSchema>;

export const ProductSizeSchema = z.object({
  label: z.string().optional(),
  name: z.string().optional(),
  price: z.number().nonnegative(),
  prontaEntrega: z.boolean().optional(),
});
export type ProductSize = z.infer<typeof ProductSizeSchema>;

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().nullable(),
  price: z.number().optional().nullable(),
  mainImage: z.string().optional().nullable(),
  images: z.array(z.string()).optional().default([]),
  moreImages: z.array(z.string()).optional().default([]),
  category: z.string().optional().nullable(),
  tags: z.union([z.array(z.string()), z.string()]).optional().nullable(),
  sizes: z.array(ProductSizeSchema).optional(),
  prontaEntrega: z.boolean().optional(),
  isNew: z.boolean().optional(),
  discount: z.number().optional().nullable(),
  weight: z.number().optional(),
  length: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});
export type Product = z.infer<typeof ProductSchema>;

export function parseProduct(input: unknown): Product {
  return ProductSchema.parse(input);
}

export type ProductView = Omit<Product, 'tags' | 'images'> & {
  tags: string[];
  images: string[];
};

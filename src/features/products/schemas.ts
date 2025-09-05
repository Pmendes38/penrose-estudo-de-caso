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
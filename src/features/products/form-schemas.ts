import { z } from 'zod';
import {
  ProductStatusSchema,
  type CreateProductDto,
  type UpdateProductDto,
} from '@/features/products/schemas';

const splitList = (v?: string | FormDataEntryValue | null) =>
  String(v ?? '')
    .split(/[,\n;]/g)
    .map(s => s.trim())
    .filter(Boolean);

const uniq = <T,>(arr: T[] = []) => Array.from(new Set(arr));

const toCents = (raw: unknown) => {
  const s = String(raw ?? '').trim();
  if (!s) return NaN;
  const cleaned = s.replace(/[^\d,.-]/g, '');
  const normalized = cleaned.includes(',') ? cleaned.replace(/\./g, '').replace(',', '.') : cleaned;
  const n = Number(normalized);
  return Number.isFinite(n) ? Math.round(n * 100) : NaN;
};

const CreateProductFormInput = z.object({
  name: z.string().min(1, 'Informe o nome'),

  category: z.string().optional().transform(v => {
    const t = (v ?? '').trim();
    return t ? t : undefined;
  }),

  price: z.string().min(1, 'Informe o preço').transform(toCents),

  stock: z.string().optional().transform(v => (v ? parseInt(v, 10) : 0)),

  status: ProductStatusSchema.default('active'),

  description: z.string().optional().transform(v => {
    const t = (v ?? '').trim();
    return t ? t : undefined;
  }),

  images: z.string().optional().transform(v => uniq(splitList(v))),
  tags: z.string().optional().transform(v => uniq(splitList(v))),

  sku: z.string().optional().transform(v => {
    const t = (v ?? '').trim();
    return t ? t : undefined;
  }),
});

export const CreateProductFormSchema = CreateProductFormInput
  .refine(v => Number.isFinite(v.price) && v.price >= 0, {
    path: ['price'],
    message: 'Preço inválido',
  })
  .transform<CreateProductDto>(v => ({
    name: v.name,
    category: v.category,
    priceCents: v.price,
    stock: v.stock ?? 0,
    status: v.status,
    description: v.description,
    images: v.images ?? [],
    tags: v.tags ?? [],
    sku: v.sku
  }));

export const UpdateProductFormSchema = CreateProductFormInput
  .partial()
  .refine(v => v.price === undefined || (Number.isFinite(v.price) && v.price >= 0), {
    path: ['price'],
    message: 'Preço inválido',
  })
  .transform<UpdateProductDto>(v => ({
    ...(v.name !== undefined && { name: v.name }),
    ...(v.category !== undefined && { category: v.category }),
    ...(v.price !== undefined && { priceCents: v.price }),
    ...(v.stock !== undefined && { stock: v.stock }),
    ...(v.status !== undefined && { status: v.status }),
    ...(v.description !== undefined && { description: v.description }),
    ...(v.images !== undefined && { images: v.images }),
    ...(v.tags !== undefined && { tags: v.tags }),
    ...(v.sku !== undefined && { sku: v.sku }),
  }));

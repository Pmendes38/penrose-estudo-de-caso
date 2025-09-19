'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createProduct, uploadProductImages } from '@/features/products/api';

const ServerFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  price: z.coerce.number().nonnegative().default(0), // BRL
  stock: z.coerce.number().int().nonnegative().default(0),
  status: z.enum(['active', 'inactive']).default('active'),
  description: z.string().optional().default(''),
  images: z.string().optional(), // CSV opcional (URLs)
  tags: z.string().optional(),   // CSV opcional
});

function csvToArray(s?: string) {
  return (s ?? '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
}

export async function createProductAction(formData: FormData) {
  // 1) Parse text fields
  const raw = Object.fromEntries(formData.entries());
  const parsed = ServerFormSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'Dados inválidos';
    throw new Error(msg);
  }

  const v = parsed.data;

  const dto = {
    name: v.name,
    category: v.category,
    priceCents: Math.round(v.price * 100), // <<<<<<<<<<<<<< AQUI ESTÁ O PONTO
    stock: v.stock,
    status: v.status,
    description: v.description ?? '',
    images: csvToArray(v.images),
    tags: csvToArray(v.tags),
  };

  const product = await createProduct(dto as any);

  const files = (formData.getAll('files') as unknown as File[]).filter(Boolean);
  if (files.length) {
    await uploadProductImages(product.id, files);
  }

  revalidatePath('/admin/products');
  redirect('/admin/products');
}

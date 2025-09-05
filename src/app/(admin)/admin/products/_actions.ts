'use server';

import { revalidatePath, redirect } from 'next/navigation';
import { productCreateSchema } from '@/features/products/schemas';
import { createProduct, updateProduct } from '@/features/products/api';

function parseForm(formData: FormData) {
  const images = String(formData.get('images') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const tags = String(formData.get('tags') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    name: String(formData.get('name') || '').trim(),
    category: String(formData.get('category') || '').trim(),
    price: formData.get('price'),
    stock: formData.get('stock') ?? 0,
    status: (String(formData.get('status')) === 'inactive' ? 'inactive' : 'active') as
      | 'active'
      | 'inactive',
    description: String(formData.get('description') || '').trim(),
    images,
    tags,
  };
}

export async function createProductAction(formData: FormData) {
  const parsed = productCreateSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Dados inválidos');
  }

  await createProduct(parsed.data);
  revalidatePath('/admin/produtos');
  redirect('/admin/produtos');
}

export async function updateProductAction(id: string, prevState: unknown, formData: FormData) {
  const parsed = productCreateSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Dados inválidos');
  }

  await updateProduct(id, parsed.data);
  revalidatePath('/admin/produtos');
  redirect('/admin/produtos');
}

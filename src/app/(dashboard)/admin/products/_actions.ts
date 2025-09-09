'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createProduct, updateProduct } from '@/features/products/api';
import {
  CreateProductFormSchema,
  UpdateProductFormSchema,
} from '@/features/products/form-schemas';

function readFormData(fd: FormData) {
  return {
    name: String(fd.get('name') ?? ''),
    category: String(fd.get('category') ?? ''),
    price: String(fd.get('price') ?? ''),
    stock: String(fd.get('stock') ?? ''),
    status: String(fd.get('status') ?? 'active') as any,
    description: String(fd.get('description') ?? ''),
    images: String(fd.get('images') ?? ''),
    tags: String(fd.get('tags') ?? ''),
    sku: String(fd.get('sku') ?? ''),
  };
}

export async function createProductAction(formData: FormData) {
  const parsed = CreateProductFormSchema.safeParse(readFormData(formData));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new Error(issue?.message ?? 'Dados inválidos');
  }

  await createProduct(parsed.data);
  revalidatePath('/admin/products');
  redirect('/admin/products');
}

export async function updateProductAction(id: string, _prev: unknown, formData: FormData) {
  const parsed = UpdateProductFormSchema.safeParse(readFormData(formData));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new Error(issue?.message ?? 'Dados inválidos');
  }

  await updateProduct(id, parsed.data);
  revalidatePath('/admin/products');
  redirect('/admin/products');
}

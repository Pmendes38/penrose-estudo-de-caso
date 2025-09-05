import { api } from '@/src/shared/lib/http';
import type { ProductCreateInput } from './schemas';

export type BackendProduct = {
  id: string;
  name: string;
};

export async function createProduct(input: ProductCreateInput) {
  // Ex: POST `${API_URL}/api/products/admin`
  return api<BackendProduct>(`${process.env.NEXT_PUBLIC_API_URL}/api/products/admin`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateProduct(id: string, input: ProductCreateInput) {
  return api<BackendProduct>(`${process.env.NEXT_PUBLIC_API_URL}/api/products/admin/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

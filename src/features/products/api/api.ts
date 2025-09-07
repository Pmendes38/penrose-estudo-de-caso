import 'server-only';
import { api } from '@/shared/lib/http';
import type { Product, ProductCreateInput } from '../schemas';

const BASE = '/api/products';

export async function fetchPublicProducts(): Promise<Product[]> {
  return api<Product[]>(`${BASE}/public`, {
    cache: 'no-store',
  });
}

export async function getProduct(
  id: string,
  opts?: { cache?: RequestCache }
): Promise<Product> {
  return api<Product>(`${BASE}/${id}`, {
    cache: opts?.cache ?? 'no-store',
  });
}

export async function getProductCached(
  id: string,
  revalidateSeconds = 300
): Promise<Product> {
  return api<Product>(`${BASE}/${id}`, {
    cache: 'force-cache',
    next: { revalidate: revalidateSeconds, tags: [`product:${id}`] },
  });
}

export async function listProducts(query?: {
  q?: string;
  page?: number;
  pageSize?: number;
}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (query?.q) params.set('q', query.q);
  if (query?.page) params.set('page', String(query.page));
  if (query?.pageSize) params.set('pageSize', String(query.pageSize));

  const qs = params.toString();
  return api<Product[]>(`${BASE}${qs ? `?${qs}` : ''}`, {
    cache: 'no-store',
  });
}

export async function createProduct(input: ProductCreateInput): Promise<Product> {
  return api<Product>(`${BASE}/admin`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateProduct(
  id: string,
  input: ProductCreateInput
): Promise<Product> {
  return api<Product>(`${BASE}/admin/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

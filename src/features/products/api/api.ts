// src/features/products/api/api.ts
import 'server-only';
import { envServer } from '@/shared/lib/env.server';
import { fetchWithAuth } from '@/features/auth/server/fetch-with-auth';
import {
  Product,
  ProductSchema,
  ProductPage,
  ProductPageSchema,
  PublicProductEnvelopeSchema,
  CreateProductDto,
  CreateProductDtoSchema,
  UpdateProductDto,
  UpdateProductDtoSchema,
} from '../schemas';

const BASE = `${envServer.AUTH_API_URL}/api/v1/products`;

function toQuery(q: Record<string, any> = {}) {
  const u = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    u.set(k, String(v));
  });
  const s = u.toString();
  return s ? `?${s}` : '';
}

export async function fetchPublicProducts(query: Partial<{
  search: string;
  category: string;
  status: 'active' | 'inactive';
  minPrice: number;
  maxPrice: number;
  page: number;
  pageSize: number;
  sortBy: 'priceCents' | 'createdAt' | 'name';
  sortDir: 'asc' | 'desc';
}> = {}): Promise<ProductPage> {
  const res = await fetch(`${BASE}${toQuery(query)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return ProductPageSchema.parse(await res.json());
}

export async function getProduct(idOrSlug: string, opts?: { cache?: RequestCache }): Promise<Product> {
  const res = await fetch(`${BASE}/${encodeURIComponent(idOrSlug)}`, {
    cache: opts?.cache ?? 'no-store',
  });
  if (!res.ok) throw new Error(await res.text());
  const env = PublicProductEnvelopeSchema.parse(await res.json());
  return env.product;
}

export async function getProductCached(idOrSlug: string, revalidateSeconds = 300): Promise<Product> {
  const res = await fetch(`${BASE}/${encodeURIComponent(idOrSlug)}`, {
    cache: 'force-cache',
    next: { revalidate: revalidateSeconds, tags: [`product:${idOrSlug}`] },
  });
  if (!res.ok) throw new Error(await res.text());
  const env = PublicProductEnvelopeSchema.parse(await res.json());
  return env.product;
}

export async function listProducts(query?: {
  q?: string;       // alias local para "search"
  page?: number;
  pageSize?: number;
}): Promise<ProductPage> {
  const mapped = {
    search: query?.q,
    page: query?.page,
    pageSize: query?.pageSize,
  };
  const res = await fetch(`${BASE}${toQuery(mapped)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return ProductPageSchema.parse(await res.json());
}

export async function createProduct(input: CreateProductDto): Promise<Product> {
  const body = JSON.stringify(CreateProductDtoSchema.parse(input));
  const res = await fetchWithAuth(`${BASE}/admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body,
  });
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return ProductSchema.parse(json.product);
}

export async function updateProduct(id: string, input: UpdateProductDto): Promise<Product> {
  const body = JSON.stringify(UpdateProductDtoSchema.parse(input));
  const res = await fetchWithAuth(`${BASE}/admin/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body,
  });
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return ProductSchema.parse(json.product);
}

import 'server-only';
import { envServer } from '@/shared/lib/env.server';
import { fetchWithAuth } from '@/features/auth/server/fetch-with-auth';
import {
  ProductQuery, ProductQuerySchema, ProductPageSchema,
  PublicProductEnvelopeSchema, ProductSchema,
  CreateProductDto, CreateProductDtoSchema,
  UpdateProductDto, UpdateProductDtoSchema,
  AdminProductPageSchema, AdminCreateResponseSchema,
  AdminUpdateResponseSchema, AdminDeleteResponseSchema,
} from './schemas';

const BASE = `${envServer.AUTH_API_URL}/api/products`;

function toQuery(q: Record<string, any> = {}) {
  const u = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    u.set(k, String(v));
  });
  const s = u.toString();
  return s ? `?${s}` : '';
}

/* ========= Public ========= */

export async function fetchPublicProducts(query: Partial<ProductQuery> = {}) {
  const params = ProductQuerySchema.partial().parse(query);
  const res = await fetch(`${BASE}${toQuery(params)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return ProductPageSchema.parse(await res.json());
}

export async function fetchPublicProduct(idOrSlug: string) {
  const res = await fetch(`${BASE}/${encodeURIComponent(idOrSlug)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  const env = PublicProductEnvelopeSchema.parse(await res.json());
  return env.product;
}

/* ========= Admin (Auth: Bearer) ========= */

export async function listProductsAdmin(page = 1, pageSize = 50) {
  const url = `${BASE}/admin/page${toQuery({ page, pageSize })}`;
  const res = await fetchWithAuth(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return AdminProductPageSchema.parse(await res.json());
}

export async function createProductAdmin(input: CreateProductDto) {
  const body = JSON.stringify(CreateProductDtoSchema.parse(input));
  const res = await fetchWithAuth(`${BASE}/admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body,
  });
  if (!res.ok) throw new Error(await res.text());
  return AdminCreateResponseSchema.parse(await res.json());
}

export async function updateProductAdmin(id: string, input: UpdateProductDto) {
  const body = JSON.stringify(UpdateProductDtoSchema.parse(input));
  const res = await fetchWithAuth(`${BASE}/admin/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body,
  });
  if (!res.ok) throw new Error(await res.text());
  return AdminUpdateResponseSchema.parse(await res.json());
}

export async function deleteProductAdmin(id: string) {
  const res = await fetchWithAuth(`${BASE}/admin/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await res.text());
  return AdminDeleteResponseSchema.parse(await res.json());
}

/* ===== stock/images/tags (admin) ===== */

export async function increaseStockAdmin(id: string, amount: number) {
  const res = await fetchWithAuth(`${BASE}/admin/${encodeURIComponent(id)}/stock/increase${toQuery({ amount })}`, {
    method: 'PUT',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await res.text());
  return ProductSchema.parse(await res.json());
}

export async function decreaseStockAdmin(id: string, amount: number) {
  const res = await fetchWithAuth(`${BASE}/admin/${encodeURIComponent(id)}/stock/decrease${toQuery({ amount })}`, {
    method: 'PUT',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await res.text());
  return ProductSchema.parse(await res.json());
}

export async function addImageAdmin(id: string, url: string) {
  const res = await fetchWithAuth(`${BASE}/admin/${encodeURIComponent(id)}/images/add${toQuery({ url })}`, {
    method: 'PUT',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await res.text());
  return ProductSchema.parse(await res.json());
}

export async function removeImageAdmin(id: string, url: string) {
  const res = await fetchWithAuth(`${BASE}/admin/${encodeURIComponent(id)}/images/remove${toQuery({ url })}`, {
    method: 'PUT',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await res.text());
  return ProductSchema.parse(await res.json());
}

export async function addTagAdmin(id: string, tag: string) {
  const res = await fetchWithAuth(`${BASE}/admin/${encodeURIComponent(id)}/tags/add${toQuery({ tag })}`, {
    method: 'PUT',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await res.text());
  return ProductSchema.parse(await res.json());
}

export async function removeTagAdmin(id: string, tag: string) {
  const res = await fetchWithAuth(`${BASE}/admin/${encodeURIComponent(id)}/tags/remove${toQuery({ tag })}`, {
    method: 'PUT',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await res.text());
  return ProductSchema.parse(await res.json());
}

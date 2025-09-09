// src/app/(dashboard)/admin/products/page.tsx
import { z } from 'zod';
import { envServer } from '@/shared/lib/env.server';
import { fetchWithAuth } from '@/features/auth/server/fetch-with-auth';
import ProductsTable from './table';

const SP = z.object({
  q: z.string().optional(),
  status: z.enum(['active','inactive']).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

// opcional: use seu ProductPageSchema; aqui um fallback minimalista:
const AdminProductPage = z.object({
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    category: z.string().nullable().optional(),
    priceCents: z.number().int().nonnegative(),
    stock: z.number().int().nonnegative().optional(),
    status: z.enum(['active','inactive']),
    images: z.array(z.string()).default([]),
    createdAt: z.string().optional().nullable(),
    updatedAt: z.string().optional().nullable(),
  })),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
});

export default async function AdminProdutos({ searchParams }: { searchParams: Record<string,string|undefined> }) {
  const { q, status, page, pageSize } = SP.parse(searchParams);

  const url = new URL(`${envServer.AUTH_API_URL}/api/v1/admin/products`);
  url.searchParams.set('page', String(page));
  url.searchParams.set('pageSize', String(pageSize));
  if (q) url.searchParams.set('q', q);
  if (status) url.searchParams.set('status', status);

  const res = await fetchWithAuth(url.toString(), { cache: 'no-store' });

  if (res.status === 401 || res.status === 403) {
    return (
      <div className="bg-red-900/40 border border-red-600 text-red-200 px-4 py-3 rounded-lg">
        Não autorizado. Faça login novamente.
      </div>
    );
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || 'Erro ao buscar produtos');
  }

  const data = AdminProductPage.parse(await res.json());

  // normalização para UI (price em BRL base 1.00)
  const normalized = {
    ...data,
    items: data.items.map(p => ({
      ...p,
      price: p.priceCents / 100,
      image: p.images?.[0] ?? null,
    })),
  };

  return <ProductsTable data={normalized} />;
}

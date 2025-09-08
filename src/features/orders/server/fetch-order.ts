'use server';

import { envServer } from '@/shared/lib/env.server';
import { fetchWithAuth } from '@/features/auth/server/fetch-with-auth';
import { OrderSchema, type Order } from '../schemas';

const BASE = `${envServer.AUTH_API_URL}/api/orders`;

export async function fetchOrderMine(id: string): Promise<Order> {
  const res = await fetchWithAuth(`${BASE}/me/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return OrderSchema.parse(await res.json());
}

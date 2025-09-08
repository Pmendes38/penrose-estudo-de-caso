import { envServer } from '@/shared/lib/env.server';
import { fetchWithAuth } from '@/features/auth/server/fetch-with-auth';
import {
  PagedOrdersSchema, OrderSchema, type PagedOrders, type Order,
  CreateOrderPayload, UpdateOrderStatusPayload,
} from '../schemas';

export async function listOrdersAdmin(params?: { page?: number; pageSize?: number }): Promise<PagedOrders> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.pageSize) qs.set('pageSize', String(params.pageSize));
  const res = await fetchWithAuth(`${envServer.AUTH_API_URL}/api/v1/orders/admin?${qs}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return PagedOrdersSchema.parse(await res.json());
}

export async function getOrderAdmin(id: string): Promise<Order> {
  const res = await fetchWithAuth(`${envServer.AUTH_API_URL}/api/v1/orders/admin/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return OrderSchema.parse(await res.json());
}

export async function updateOrderStatusAdmin(id: string, payload: UpdateOrderStatusPayload) {
  const res = await fetchWithAuth(`${envServer.AUTH_API_URL}/api/v1/orders/admin/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type':'application/json' },
    cache: 'no-store',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  // backend responde { message, order }
  const json = await res.json();
  return { message: String(json?.message ?? 'OK'), order: OrderSchema.parse(json.order) };
}

export async function cancelOrderAdmin(id: string) {
  const res = await fetchWithAuth(`${envServer.AUTH_API_URL}/api/v1/orders/admin/${id}/cancel`, { method: 'PUT', cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function refundOrderAdmin(id: string) {
  const res = await fetchWithAuth(`${envServer.AUTH_API_URL}/api/v1/orders/admin/${id}/refund`, { method: 'PUT', cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

// Customer
export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const res = await fetchWithAuth(`${envServer.AUTH_API_URL}/api/v1/orders`, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    cache: 'no-store',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return OrderSchema.parse(await res.json());
}

export async function listMyOrders(customerId: string, params?: { page?: number; pageSize?: number }): Promise<PagedOrders> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.pageSize) qs.set('pageSize', String(params.pageSize));
  const res = await fetchWithAuth(`${envServer.AUTH_API_URL}/api/v1/orders/me/${customerId}?${qs}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return PagedOrdersSchema.parse(await res.json());
}

import 'server-only';
import { PaginatedSchema, CustomerSchema, type Customer } from './types';

const CustomersPageSchema = PaginatedSchema(CustomerSchema);
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

type FetchParams = { page: number; pageSize: number; q?: string; token?: string };

export async function fetchAdminCustomers({ page, pageSize, q, token }: FetchParams) {
  const url = new URL('/api/customers/admin', API_BASE || 'http://localhost');
  url.searchParams.set('page', String(page));
  url.searchParams.set('pageSize', String(pageSize));
  if (q) url.searchParams.set('q', q);

  const res = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store', 
  });

  if (!res.ok) {
    if (process.env.NODE_ENV !== 'production') {
      const mock: { items: Customer[]; total: number; page: number; pageSize: number } = {
        items: [
          {
            id: '1',
            name: 'João Silva',
            email: 'contato@example.com',
            phone: '(00) 00000-0000',
            totalOrders: 3,
            totalSpent: 1299.7,
            lastOrder: '2025-01-15',
            status: 'active',
          },
          {
            id: '2',
            name: 'Maria Santos',
            email: 'contato@example.com',
            phone: '(00) 00000-0000',
            totalOrders: 1,
            totalSpent: 250,
            lastOrder: '2025-01-14',
            status: 'active',
          },
        ],
        total: 2,
        page,
        pageSize,
      };
      return CustomersPageSchema.parse(mock);
    }
    throw new Error(`Failed to fetch customers: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return CustomersPageSchema.parse(data);
}

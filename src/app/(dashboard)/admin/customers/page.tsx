import { fetchAdminCustomers } from '@/shared/lib/admin-customers';
import CustomersTable from './table';
import { Suspense } from 'react';

export const metadata = { title: 'Clientes | Admin' };

type SearchParams = { page?: string; pageSize?: string; q?: string };

export default async function AdminCustomersPage({ searchParams }: { searchParams: SearchParams }) {
  const page = Number(searchParams.page ?? 1);
  const pageSize = Number(searchParams.pageSize ?? 20);
  const q = searchParams.q?.trim() || undefined;

  const data = await fetchAdminCustomers({ page, pageSize, q /*, token*/ });

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-brand-gray-light">Clientes</h2>
        <p className="mt-1 text-sm text-brand-gray">Gerencie todos os clientes do sistema</p>
      </header>

      <Suspense fallback={<div className="bg-brand-gray-dark rounded-lg border border-brand-gray-border p-6">Carregando…</div>}>
        <CustomersTable data={data} />
      </Suspense>
    </div>
  );
}

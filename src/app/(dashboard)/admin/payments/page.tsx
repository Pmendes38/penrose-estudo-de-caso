// src/app/(dashboard)/admin/payments/page.tsx
import { requireAdminOrRedirect } from '@/features/auth/server/guards';
import { fetchAdminPayments } from '@/features/payments/server/fetch-admin-payments';
import PaymentsTable from './table';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type SearchParams = {
  page?: string;
  pageSize?: string;
  status?: string;
  billingType?: string;
  orderId?: string;
  providerPaymentId?: string;
};

function qs(params: Record<string, string | number | undefined>) {
  const u = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') u.set(k, String(v));
  });
  const s = u.toString();
  return s ? `?${s}` : '';
}

export default async function AdminPaymentsPage({ searchParams }: { searchParams: SearchParams }) {
  requireAdminOrRedirect();

  const page = Number(searchParams.page || 1);
  const pageSize = Number(searchParams.pageSize || 20);
  const filters = {
    status: searchParams.status,
    billingType: searchParams.billingType,
    orderId: searchParams.orderId,
    providerPaymentId: searchParams.providerPaymentId,
  };

  const data = await fetchAdminPayments({ page, pageSize, filters });

  const base = {
    ...filters,
    pageSize,
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Pagamentos</h1>

      {/* Filtros */}
      <form method="GET" className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col">
          <label className="text-sm">Status</label>
          <select name="status" defaultValue={filters.status ?? ''} className="bg-brand-gray-dark border border-brand-gray-border rounded px-2 py-1">
            <option value="">Todos</option>
            <option value="PENDING">PENDING</option>
            <option value="AUTHORIZED">AUTHORIZED</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="CANCELED">CANCELED</option>
            <option value="REFUNDED">REFUNDED</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm">Billing</label>
          <select name="billingType" defaultValue={filters.billingType ?? ''} className="bg-brand-gray-dark border border-brand-gray-border rounded px-2 py-1">
            <option value="">Todos</option>
            <option value="PIX">PIX</option>
            <option value="BOLETO">BOLETO</option>
            <option value="CREDIT_CARD">CREDIT_CARD</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm">OrderId</label>
          <input name="orderId" defaultValue={filters.orderId ?? ''} className="bg-brand-gray-dark border border-brand-gray-border rounded px-2 py-1" />
        </div>
        <div className="flex flex-col">
          <label className="text-sm">ProviderPaymentId</label>
          <input name="providerPaymentId" defaultValue={filters.providerPaymentId ?? ''} className="bg-brand-gray-dark border border-brand-gray-border rounded px-2 py-1" />
        </div>
        <input type="hidden" name="page" value="1" />
        <input type="hidden" name="pageSize" value={pageSize} />
        <button className="bg-brand-blue text-white rounded px-4 py-2">Filtrar</button>
      </form>

      <PaymentsTable data={data} />

      {/* Paginação simples */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-sm text-brand-gray">
          Página {data.page} de {data.pages} — {data.total} registros
        </span>
        <div className="flex gap-2">
          <Link
            href={qs({ ...base, page: Math.max(1, data.page - 1) })}
            className="px-3 py-1 border border-brand-gray-border rounded hover:bg-brand-gray/30 disabled:opacity-50"
            aria-disabled={data.page <= 1}
          >
            ← Anterior
          </Link>
          <Link
            href={qs({ ...base, page: Math.min(data.pages, data.page + 1) })}
            className="px-3 py-1 border border-brand-gray-border rounded hover:bg-brand-gray/30 disabled:opacity-50"
            aria-disabled={data.page >= data.pages}
          >
            Próxima →
          </Link>
        </div>
      </div>
    </div>
  );
}

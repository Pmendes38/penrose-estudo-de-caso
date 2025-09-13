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

const VALID_STATUS = new Set([
  'PENDING',
  'AUTHORIZED',
  'CONFIRMED',
  'CANCELED',
  'REFUNDED',
  'FAILED',
] as const);

const VALID_BILLING = new Set(['PIX', 'BOLETO', 'CREDIT_CARD'] as const);

function qs(params: Record<string, string | number | undefined>) {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') u.set(k, String(v));
  }
  const s = u.toString();
  return s ? `?${s}` : '';
}

export default async function AdminPaymentsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdminOrRedirect();

  const pageRaw = Number(searchParams.page ?? 1);
  const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1;

  const pageSizeRaw = Number(searchParams.pageSize ?? 20);
  const pageSize = Number.isFinite(pageSizeRaw) ? Math.min(Math.max(pageSizeRaw, 1), 100) : 20;

  const status =
    searchParams.status && VALID_STATUS.has(searchParams.status as typeof VALID_STATUS extends Set<infer T> ? T : never)
      ? (searchParams.status as "PENDING" | "AUTHORIZED" | "CONFIRMED" | "CANCELED" | "REFUNDED" | "FAILED")
      : undefined;

  const billingType =
    searchParams.billingType && VALID_BILLING.has(searchParams.billingType as typeof VALID_BILLING extends Set<infer T> ? T : never)
      ? (searchParams.billingType as "PIX" | "BOLETO" | "CREDIT_CARD")
      : undefined;

  const orderId = (searchParams.orderId ?? '').trim() || undefined;
  const providerPaymentId = (searchParams.providerPaymentId ?? '').trim() || undefined;

  const filters = { status, billingType, orderId, providerPaymentId };

  const data = await fetchAdminPayments({ page, pageSize, filters });

  const baseParams = { ...filters, pageSize };

  const prevDisabled = data.page <= 1;
  const nextDisabled = data.page >= data.pages;

  const prevHref = prevDisabled ? undefined : qs({ ...baseParams, page: data.page - 1 });
  const nextHref = nextDisabled ? undefined : qs({ ...baseParams, page: data.page + 1 });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Pagamentos</h1>

      {/* Filtros */}
      <form method="GET" className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col">
          <label className="text-sm">Status</label>
          <select
            name="status"
            defaultValue={status ?? ''}
            className="bg-brand-gray-dark border border-brand-gray-border rounded px-2 py-1"
          >
            <option value="">Todos</option>
            {[...VALID_STATUS].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm">Billing</label>
          <select
            name="billingType"
            defaultValue={billingType ?? ''}
            className="bg-brand-gray-dark border border-brand-gray-border rounded px-2 py-1"
          >
            <option value="">Todos</option>
            {[...VALID_BILLING].map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm">OrderId</label>
          <input
            name="orderId"
            defaultValue={orderId ?? ''}
            className="bg-brand-gray-dark border border-brand-gray-border rounded px-2 py-1"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm">ProviderPaymentId</label>
          <input
            name="providerPaymentId"
            defaultValue={providerPaymentId ?? ''}
            className="bg-brand-gray-dark border border-brand-gray-border rounded px-2 py-1"
          />
        </div>

        <input type="hidden" name="page" value="1" />
        <input type="hidden" name="pageSize" value={pageSize} />

        <div className="flex gap-2">
          <button className="bg-brand-blue text-white rounded px-4 py-2">Filtrar</button>
          <Link
            href="/admin/payments"
            className="px-4 py-2 border border-brand-gray-border rounded hover:bg-brand-gray/30"
            prefetch={false}
          >
            Limpar
          </Link>
        </div>
      </form>

      <PaymentsTable data={data} />

      {/* Paginação simples */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-sm text-brand-gray">
          Página {data.page} de {data.pages} — {data.total} registros
        </span>

        <div className="flex gap-2">
          {prevDisabled ? (
            <span
              className="px-3 py-1 border border-brand-gray-border rounded opacity-50 cursor-not-allowed"
              aria-disabled="true"
            >
              ← Anterior
            </span>
          ) : (
            <Link
              href={prevHref!}
              className="px-3 py-1 border border-brand-gray-border rounded hover:bg-brand-gray/30"
              prefetch={false}
            >
              ← Anterior
            </Link>
          )}

          {nextDisabled ? (
            <span
              className="px-3 py-1 border border-brand-gray-border rounded opacity-50 cursor-not-allowed"
              aria-disabled="true"
            >
              Próxima →
            </span>
          ) : (
            <Link
              href={nextHref!}
              className="px-3 py-1 border border-brand-gray-border rounded hover:bg-brand-gray/30"
              prefetch={false}
            >
              Próxima →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

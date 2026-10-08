'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition, useState } from 'react';
import type { PaginatedPayments } from '@/features/payments/schemas';
import { cancelPaymentAction, refundPaymentAction, approveDemoPaymentAction } from './actions';
import { useFormState, useFormStatus } from 'react-dom';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function ApproveButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="rounded bg-green-800 px-3 py-1 text-white disabled:opacity-50">{pending ? 'Aprovando…' : 'Aprovar (simulado)'}</button>;
}

function CancelButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      className="px-3 py-1 border border-brand-gray-border rounded hover:bg-brand-gray/30 disabled:opacity-50"
      disabled={disabled || pending}
      title="Cancelar pagamento"
    >
      {pending ? 'Cancelando…' : 'Cancelar'}
    </button>
  );
}

function RefundButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      className="px-3 py-1 border border-brand-gray-border rounded hover:bg-brand-gray/30 disabled:opacity-50"
      disabled={disabled || pending}
      title="Estornar (refund)"
    >
      {pending ? 'Estornando…' : 'Refund'}
    </button>
  );
}

export default function PaymentsTable({ data }: { data: PaginatedPayments }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pendingTransition, startTransition] = useTransition();

  const [cancelState, cancelAction] = useFormState(cancelPaymentAction, { ok: false } as any);
  const [refundState, refundAction] = useFormState(refundPaymentAction, { ok: false } as any);
  const [approveState, approveAction] = useFormState(approveDemoPaymentAction, { ok: false } as any);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const goPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    startTransition(() => router.push(`/admin/payments?${params.toString()}`));
  };

  return (
    <div className="space-y-3">
      {(cancelState.error || refundState.error || approveState.error) && (
        <div role="alert" className="text-red-400">{cancelState.error || refundState.error || approveState.error}</div>
      )}

      <div className="overflow-auto border border-brand-gray-border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-brand-gray-dark">
            <tr className="text-left">
              <th className="p-3">ID</th>
              <th className="p-3">Order</th>
              <th className="p-3">Billing</th>
              <th className="p-3">Status</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Criado</th>
              <th className="p-3 w-[260px]">Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((p) => {
              const amountBrl = brl.format((p.amount ?? 0) / 100);
              const created = p.createdAt ? new Date(p.createdAt as any).toLocaleString('pt-BR') : '-';

              const canCancel =
                !pendingTransition &&
                p.status !== 'CANCELED' &&
                p.status !== 'REFUNDED' &&
                p.status !== 'CONFIRMED';

              const canRefund = !pendingTransition && p.status === 'CONFIRMED';

              return (
                <tr key={p.id} className="border-t border-brand-gray-border">
                  <td className="p-3 font-mono text-xs break-all">{p.id}</td>
                  <td className="p-3">
                    <Link href={`/admin/orders/${p.orderId}`} className="text-brand-blue underline" prefetch={false}>
                      {p.orderId}
                    </Link>
                  </td>
                  <td className="p-3">{p.billingType}</td>
                  <td className="p-3">{p.status}</td>
                  <td className="p-3">{amountBrl}</td>
                  <td className="p-3">{created}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      {p.provider === 'DEMO' && p.status === 'PENDING' && <form action={approveAction} onSubmit={() => setSelectedId(p.id)}><input type="hidden" name="id" value={p.id} /><ApproveButton /></form>}
                      {/* Cancelar */}
                      <form action={cancelAction} onSubmit={() => setSelectedId(p.id)}>
                        <input type="hidden" name="id" value={p.id} />
                        <CancelButton disabled={!canCancel} />
                      </form>

                      {/* Refund */}
                      <form action={refundAction} onSubmit={() => setSelectedId(p.id)}>
                        <input type="hidden" name="id" value={p.id} />
                        <RefundButton disabled={!canRefund} />
                      </form>

                      {/* Ver pedido */}
                      <Link
                        href={`/admin/orders/${p.orderId}`}
                        className="px-3 py-1 bg-brand-blue text-white rounded hover:bg-blue-600"
                        prefetch={false}
                      >
                        Pedido
                      </Link>
                    </div>

                    {selectedId === p.id && (cancelState.ok || refundState.ok || approveState.ok) && (
                      <span className="ml-2 text-brand-gray text-xs">Atualizado.</span>
                    )}
                  </td>
                </tr>
              );
            })}

            {data.items.length === 0 && (
              <tr>
                <td className="p-6 text-center text-brand-gray" colSpan={7}>
                  Nenhum pagamento encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação (client-side) */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-brand-gray">
          Página {data.page} de {data.pages} — {data.total} itens
        </span>
        <div className="flex gap-2">
          <button
            disabled={data.page <= 1 || pendingTransition}
            onClick={() => goPage(data.page - 1)}
            className="px-3 py-1 border border-brand-gray-border rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            disabled={data.page >= data.pages || pendingTransition}
            onClick={() => goPage(data.page + 1)}
            className="px-3 py-1 border border-brand-gray-border rounded disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
}

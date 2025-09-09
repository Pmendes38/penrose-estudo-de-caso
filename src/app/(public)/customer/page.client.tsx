'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { updateProfileAction } from './actions';
import { formatBRL, formatDate } from '@/shared/lib/format';

import type { Me } from '@/features/users/schemas';
import type { PagedOrders, Order } from '@/features/orders/schemas';

function getOrderTotalCents(
  order: Partial<Record<'totalCents' | 'totalAmountCents' | 'amountCents', number>>,
): number {
  return order.totalCents ?? order.totalAmountCents ?? order.amountCents ?? 0;
}

function getItemTotalCents(
  item: Partial<Record<'priceCents' | 'totalCents' | 'unitPriceCents' | 'quantity', number>>,
): number {
  if (typeof item.totalCents === 'number') return item.totalCents;
  if (typeof item.priceCents === 'number') return item.priceCents;
  if (typeof item.unitPriceCents === 'number' && typeof item.quantity === 'number') {
    return item.unitPriceCents * item.quantity;
  }
  return 0;
}

function label(status: Order['status'] | string): [string, string] {
  const s = String(status).toLowerCase();
  const map: Record<string, [string, string]> = {
    pending: ['Pendente', 'bg-yellow-900/40 text-yellow-100'],
    processing: ['Processando', 'bg-blue-900/40 text-blue-100'],
    paid: ['Pago', 'bg-emerald-900/40 text-emerald-100'],
    shipped: ['Enviado', 'bg-indigo-900/40 text-indigo-100'],
    delivered: ['Entregue', 'bg-green-900/40 text-green-100'],
    canceled: ['Cancelado', 'bg-red-900/40 text-red-100'],
    cancelled: ['Cancelado', 'bg-red-900/40 text-red-100'],
    refunded: ['Reembolsado', 'bg-purple-900/40 text-purple-100'],
  };
  return map[s] ?? ['—', 'bg-gray-900/40 text-gray-100'];
}

type FormState =
  | { ok: true }
  | { ok: false; message: string }
  | null;

async function updateProfileReducer(_prev: FormState, fd: FormData): Promise<FormState> {
  try {
    await updateProfileAction(fd);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? 'Erro ao atualizar perfil' };
  }
}

export default function CustomerClient({
  me,
  ordersPage,
}: {
  me: Me | null;
  ordersPage: PagedOrders;
}) {
  const [state, formAction] = useFormState<FormState, FormData>(updateProfileReducer, null);

  return (
    <div className="min-h-screen bg-brand-black">

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <aside className="lg:col-span-1">
          <div className="bg-brand-gray-dark rounded-lg p-6 border border-brand-gray-border">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-brand-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">👤</span>
              </div>
              <h2 className="text-xl font-bold text-white">{me?.name ?? '—'}</h2>
              <p className="text-brand-gray">{me?.email ?? '—'}</p>
            </div>

            <form action={formAction} className="space-y-4" noValidate>
              <div>
                <label className="block text-sm text-brand-gray-light mb-1" htmlFor="name">
                  Nome
                </label>
                <input
                  id="name"
                  name="name"
                  defaultValue={me?.name ?? ''}
                  autoComplete="name"
                  className="w-full bg-brand-gray border border-brand-gray-border text-brand-gray-light py-2 px-3 rounded"
                />
              </div>

              <div>
                <label className="block text-sm text-brand-gray-light mb-1" htmlFor="phone">
                  Telefone
                </label>
                <input
                  id="phone"
                  name="phone"
                  defaultValue={me?.phone ?? ''}
                  autoComplete="tel"
                  className="w-full bg-brand-gray border border-brand-gray-border text-brand-gray-light py-2 px-3 rounded"
                />
              </div>

              <div aria-live="polite" className="min-h-5">
                {state?.ok === false && (
                  <p className="text-red-300 text-sm">{state.message}</p>
                )}
                {state?.ok === true && (
                  <p className="text-emerald-300 text-sm">Perfil atualizado!</p>
                )}
              </div>

              <SubmitButton>💾 Salvar Alterações</SubmitButton>
            </form>
          </div>
        </aside>

        {/* Pedidos */}
        <section className="lg:col-span-2">
          <div className="bg-brand-gray-dark rounded-lg border border-brand-gray-border">
            <div className="px-6 py-4 border-b border-brand-gray-border flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Meus Pedidos ({ordersPage.total})</h3>
            </div>

            <ul className="divide-y divide-brand-gray-border">
              {ordersPage.items.map((order) => {
                const [lab, cls] = label(order.status as any);
                const totalCents = getOrderTotalCents(order as any);

                return (
                  <li key={order.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-white">
                          Pedido #{('code' in (order as any) && (order as any).code) ?? (order as any).orderNumber ?? order.id}
                        </h4>
                        <p className="text-brand-gray text-sm">
                          {formatDate(String(order.createdAt))}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${cls}`}>
                        {lab}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      {(order.items ?? []).map((it: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-4">
                          <Image
                            src={it.image ?? '/assets/placeholder.jpg'}
                            alt={it.name ?? 'Item'}
                            width={64}
                            height={64}
                            className="rounded-lg object-cover w-16 h-16"
                          />
                          <div className="flex-1">
                            <h5 className="text-white font-medium">{it.name ?? 'Item'}</h5>
                            {it.size && (
                              <p className="text-brand-gray text-sm">Tamanho: {it.size}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-brand-blue font-semibold">
                              {formatBRL(getItemTotalCents(it) / 100)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-brand-gray-border">
                      <p className="text-lg font-bold text-white">
                        Total: {formatBRL(totalCents / 100)}
                      </p>
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-brand-blue hover:text-blue-300 text-sm font-medium"
                      >
                        👁️ Ver Detalhes
                      </Link>
                    </div>
                  </li>
                );
              })}

              {ordersPage.items.length === 0 && (
                <li className="p-12 text-center">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold text-brand-gray-light mb-2">
                    Nenhum pedido encontrado
                  </h3>
                  <p className="text-brand-gray mb-6">
                    Você ainda não fez nenhum pedido.
                  </p>
                  <Link
                    href="/catalog"  // antes: "/#catalogo"
                    className="bg-brand-blue hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg"
                  >
                    🛒 Fazer Primeira Compra
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full mt-4 bg-brand-blue hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg"
    >
      {pending ? 'Salvando…' : children}
    </button>
  );
}

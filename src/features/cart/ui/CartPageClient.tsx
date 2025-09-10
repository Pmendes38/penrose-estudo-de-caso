'use client';
import { useCart } from '@/features/cart/hooks/useCart';
import type { Cart } from '@/features/cart/schema';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function CartPageClient({ initialCart }: { initialCart?: Cart }) {
  const router = useRouter();
  const {
    cart,
    isLoading,
    update,
    remove,
    apply,
    unapply,
    requestQuotes,
    quotes,
    selectShip,
    prepare,
  } = useCart({ fallbackData: initialCart });

  const [coupon, setCoupon] = useState('');
  const [postal, setPostal] = useState('');
  const [isPending, startTransition] = useTransition();

  if (isLoading && !cart) return <div className="p-6">Carregando carrinho…</div>;
  if (!cart) return <div className="p-6">Seu carrinho está vazio.</div>;

  const subtotal = centsToBRL(cart.itemsSubtotal);
  const discount = centsToBRL(cart.discountTotal);
  const shipping = centsToBRL(cart.shippingTotal);
  const total = centsToBRL(cart.grandTotal);

  return (
    <div className="mx-auto max-w-5xl p-6 grid gap-6 md:grid-cols-[1fr_380px]">
      {/* Lista de itens */}
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Seu carrinho</h1>

        {cart.items.length === 0 && (
          <p className="text-sm text-gray-500">Nenhum item adicionado.</p>
        )}

        {cart.items.map((it) => (
          <div key={it.id} className="flex items-center gap-4 rounded-xl border p-4">
            {it.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={it.image} alt={it.name ?? it.sku} className="h-20 w-20 rounded object-cover" />
            ) : (
              <div className="h-20 w-20 rounded bg-gray-100" />
            )}

            <div className="flex-1">
              <div className="font-medium">{it.name ?? it.sku}</div>
              {it.variant && (
                <div className="text-xs text-gray-500">
                  {Object.entries(it.variant).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                </div>
              )}
              <div className="mt-1 text-sm">{centsToBRL(it.unitPrice)}</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="rounded border px-2 py-1"
                onClick={() => update(it.id, { quantity: Math.max(1, it.quantity - 1) })}
              >
                -
              </button>
              <span className="w-6 text-center">{it.quantity}</span>
              <button
                className="rounded border px-2 py-1"
                onClick={() => update(it.id, { quantity: it.quantity + 1 })}
              >
                +
              </button>
            </div>

            <div className="w-24 text-right font-semibold">{centsToBRL(it.total)}</div>

            <button
              className="ml-2 text-sm text-red-500 hover:underline"
              onClick={() => remove(it.id)}
            >
              Remover
            </button>
          </div>
        ))}

        {/* Cupom */}
        <div className="rounded-xl border p-4">
          <div className="font-medium mb-2">Cupom de desconto</div>
          <div className="flex gap-2">
            <input
              className="flex-1 rounded border px-3 py-2"
              placeholder="EXEMPLO10"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value.toUpperCase())}
            />
            <button
              className="rounded bg-black px-4 py-2 text-white"
              onClick={() => apply(coupon)}
              disabled={!coupon}
            >
              Aplicar
            </button>
          </div>
          {cart.coupons?.length ? (
            <div className="mt-2 text-xs text-gray-600">
              Aplicados: {cart.coupons.join(', ')}{' '}
              <button className="ml-2 underline" onClick={() => unapply(cart.coupons[0])}>
                remover
              </button>
            </div>
          ) : null}
        </div>

        {/* Frete */}
        <div className="rounded-xl border p-4 space-y-3">
          <div className="font-medium">Calcular frete</div>
          <div className="flex gap-2">
            <input
              className="flex-1 rounded border px-3 py-2"
              placeholder="CEP"
              value={postal}
              onChange={(e) => setPostal(e.target.value)}
            />
            <button
              className="rounded bg-black px-4 py-2 text-white"
              onClick={() => requestQuotes(postal)}
              disabled={!postal}
            >
              Calcular
            </button>
          </div>

          {quotes?.quotes?.length ? (
            <div className="space-y-2">
              {quotes.quotes.map((q) => (
                <label key={q.serviceCode} className="flex items-center gap-3 rounded border p-3">
                  <input
                    type="radio"
                    name="ship"
                    onChange={() =>
                      selectShip({ serviceCode: q.serviceCode, address: { postalCode: quotes.postalCode } })
                    }
                    checked={cart.shipping?.serviceCode === q.serviceCode}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{q.label}</div>
                    <div className="text-xs text-gray-500">
                      {q.days ? `${q.days} dia(s)` : 'prazo informado no rastreio'}
                    </div>
                  </div>
                  <div className="font-semibold">{q.isFree ? 'Grátis' : centsToBRL(q.amount)}</div>
                </label>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Resumo */}
      <aside className="space-y-4">
        <div className="rounded-xl border p-4 space-y-2">
          <div className="flex justify-between text-sm"><span>Subtotal</span><span>{subtotal}</span></div>
          <div className="flex justify-between text-sm"><span>Descontos</span><span>-{discount}</span></div>
          <div className="flex justify-between text-sm"><span>Frete</span><span>{shipping}</span></div>
          <div className="border-t pt-2 flex justify-between font-semibold"><span>Total</span><span>{total}</span></div>
          <button
            className="mt-3 w-full rounded bg-emerald-600 py-2 text-white disabled:opacity-50"
            disabled={cart.items.length === 0 || isPending}
            onClick={() =>
              startTransition(async () => {
                const res = await prepare();
                router.push(`/checkout?draft=${encodeURIComponent(res.orderDraftId)}`);
              })
            }
          >
            Finalizar compra
          </button>
        </div>
      </aside>
    </div>
  );
}

function centsToBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

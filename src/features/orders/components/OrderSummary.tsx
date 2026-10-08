// src/features/orders/components/OrderSummary.tsx
import { fetchOrderMine } from '@/features/orders/server/fetch-order';
import type { Order } from '@/features/orders/schemas';
import { formatCents } from '@/shared/lib/format';
import { cn } from '@/shared/lib/cn'; // util opcional (clsx/twMerge); remova se não tiver

export function OrderSummarySkeleton() {
  return (
    <div className="mt-6 w-full max-w-xl mx-auto rounded-lg border border-brand-gray-border bg-brand-gray-dark p-5 space-y-3">
      <div className="h-5 w-40 bg-brand-gray/40 rounded" />
      <div className="h-4 w-64 bg-brand-gray/30 rounded" />
      <div className="h-4 w-48 bg-brand-gray/30 rounded" />
      <div className="h-0.5 bg-brand-gray-border" />
      <div className="space-y-2">
        <div className="h-4 w-full bg-brand-gray/20 rounded" />
        <div className="h-4 w-3/4 bg-brand-gray/20 rounded" />
        <div className="h-4 w-1/2 bg-brand-gray/20 rounded" />
      </div>
      <div className="h-0.5 bg-brand-gray-border" />
      <div className="flex justify-between">
        <div className="h-5 w-20 bg-brand-gray/30 rounded" />
        <div className="h-5 w-24 bg-brand-gray/30 rounded" />
      </div>
    </div>
  );
}

function Badge({ status }: { status: Order['status'] }) {
  const map: Record<Order['status'], string> = {
    pending: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    processing: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    paid: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    shipped: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    delivered: 'bg-green-500/15 text-green-300 border-green-500/30',
    canceled: 'bg-red-500/15 text-red-300 border-red-500/30',
    refunded: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
  };
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border',
      map[status]
    )}>
      {status.toUpperCase()}
    </span>
  );
}

/**
 * Server Component
 * - Busca o pedido e renderiza um resumo compacto
 * - Assuma que o usuário atual tem permissão para ler essa rota
 *   (admin) — ou altere para um endpoint “me/:id” quando existir.
 */
export default async function OrderSummary({ orderId }: { orderId: string }) {
  if (!orderId) return null;

  let order: Order | null = null;
  try {
    order = await fetchOrderMine(orderId);
  } catch {
    return (
      <div className="mt-6 w-full max-w-xl mx-auto rounded-lg border border-red-500/30 bg-red-900/20 p-5 text-red-200">
        Não foi possível carregar os detalhes do pedido.
      </div>
    );
  }

  const created = new Date(order.createdAt);
  const lines = order.items ?? [];

  return (
    <div className="mt-6 w-full max-w-xl mx-auto rounded-lg border border-brand-gray-border bg-brand-gray-dark p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-brand-gray-light font-semibold">
          Pedido #{order.orderNumber}
        </h3>
        <Badge status={order.status} />
      </div>
      <p className="text-xs text-brand-gray mb-4">
        Criado em {created.toLocaleString('pt-BR')}
      </p>

      {lines.length ? (
        <div className="mb-4 space-y-2">
          {lines.map((it) => (
            <div key={it.productId + it.name} className="flex items-center justify-between text-sm">
              <div className="text-brand-gray-light">
                {it.name}
                {it.size ? <span className="text-brand-gray"> • {it.size}</span> : null}
                <span className="text-brand-gray"> × {it.quantity}</span>
              </div>
              <div className="text-brand-gray-light">
                {formatCents(it.unitPrice * it.quantity)}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <hr className="border-brand-gray-border my-3" />

      <div className="space-y-1 text-sm">
        <Row label="Subtotal" value={formatCents(order.subtotal)} />
        <Row label="Frete" value={formatCents(order.shippingTotal)} />
        {order.discountTotal ? <Row label="Descontos" value={`- ${formatCents(order.discountTotal)}`} /> : null}
        <div className="flex items-center justify-between text-white font-semibold pt-1">
          <span>Total</span>
          <span>{formatCents(order.grandTotal)}</span>
        </div>
      </div>

      {order.couponCode || order.notes ? (
        <div className="mt-4 text-xs text-brand-gray space-y-1">
          {order.couponCode ? <p>Cupom: <span className="text-brand-gray-light">{order.couponCode}</span></p> : null}
          {order.notes ? (
            <details className="opacity-80">
              <summary className="cursor-pointer">Observações / Endereço</summary>
              <pre className="mt-1 whitespace-pre-wrap text-brand-gray-light">{order.notes}</pre>
            </details>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-brand-gray">{label}</span>
      <span className="text-brand-gray-light">{value}</span>
    </div>
  );
}

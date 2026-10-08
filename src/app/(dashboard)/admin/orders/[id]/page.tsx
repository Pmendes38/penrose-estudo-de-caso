// src/app/(dashboard)/admin/orders/[id]/page.tsx
import { getOrderAdmin } from '@/features/orders/api';
import StatusForm from './ui/StatusForm';
import Link from 'next/link';
import ProductionForm from '../../production/ProductionForm';
import { productionLabels } from '@/features/orders/schemas';

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getOrderAdmin(params.id);

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Pedido #{order.orderNumber}</h1>
        <span className="capitalize px-2 py-1 rounded border border-brand-gray-border">{order.status}</span>
      </header>
      <div className="flex gap-4"><Link className="text-brand-blue underline" href={`/admin/payments?orderId=${order.id}`}>Ver pagamento</Link><Link className="text-brand-blue underline" href="/admin/production">Kanban de produção</Link></div>

      <section className="space-y-3 rounded border border-brand-gray-border p-4">
        <h2 className="font-semibold">O.S. #{order.orderNumber} · Produção sob encomenda</h2>
        {order.status === 'paid' ? <ProductionForm id={order.id} current={order.productionStage} /> : <p className="text-sm text-brand-gray">Produção disponível somente com pagamento aprovado.</p>}
        {!!order.productionHistory?.length && <ul className="space-y-1 text-sm text-brand-gray">{order.productionHistory.map((entry, i) => <li key={i}>{productionLabels[entry.stage]} · {entry.at.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</li>)}</ul>}
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        {order.cancellationRequest && <div className="border border-amber-400/40 rounded p-4 md:col-span-2"><h2 className="font-semibold">Solicitação de cancelamento</h2><p>{order.cancellationRequest.reason}</p><p className="text-sm">Recebida em {order.cancellationRequest.requestedAt.toLocaleString('pt-BR')}. Não altera o pagamento automaticamente.</p></div>}
        <div className="border border-brand-gray-border rounded p-4">
          <h2 className="font-semibold mb-2">Itens</h2>
          <ul className="space-y-2">
            {(order.items ?? []).map((it, idx) => (
              <li key={idx} className="flex justify-between text-sm">
                <span>{it.name}{it.size ? ` (${it.size})` : ''} × {it.quantity}</span>
                <span>R$ {(it.unitPrice * it.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <hr className="my-3 border-brand-gray-border" />
          <div className="text-sm space-y-1">
            <div className="flex justify-between"><span>Subtotal</span><span>R$ {order.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Frete</span><span>R$ {order.shippingTotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Descontos</span><span>- R$ {order.discountTotal.toFixed(2)}</span></div>
            <div className="flex justify-between font-semibold"><span>Total</span><span>R$ {order.grandTotal.toFixed(2)}</span></div>
          </div>
        </div>

        <div className="border border-brand-gray-border rounded p-4">
          <h2 className="font-semibold mb-2">Ações</h2>
          <StatusForm id={order.id} current={order.status} />
        </div>
      </section>
    </div>
  );
}

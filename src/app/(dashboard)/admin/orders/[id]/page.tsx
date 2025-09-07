// src/app/(dashboard)/admin/orders/[id]/page.tsx
import { getOrderAdmin } from '@/features/orders/api/api';
import StatusForm from './ui/StatusForm';

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getOrderAdmin(params.id);

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Pedido #{order.orderNumber}</h1>
        <span className="capitalize px-2 py-1 rounded border border-brand-gray-border">{order.status}</span>
      </header>

      <section className="grid md:grid-cols-2 gap-6">
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

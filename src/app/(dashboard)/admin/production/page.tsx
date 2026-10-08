import Link from 'next/link';
import { listProductionAdmin } from '@/features/orders/api';
import { ProductionStage, productionLabels } from '@/features/orders/schemas';
import ProductionForm from './ProductionForm';

export const dynamic = 'force-dynamic';

export default async function ProductionPage() {
  const orders = await listProductionAdmin();
  return <section className="space-y-6">
    <div><h2 className="text-2xl font-semibold">Kanban de produção</h2><p className="mt-2 text-sm text-[#9ca3af]">Ordens de serviço de pedidos pagos. Mover a etapa não altera o pagamento nem confirma envio.</p><Link href="/admin/orders" className="mt-3 inline-block text-[#60a5fa] underline">Abrir pedidos para criar uma O.S.</Link></div>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">{ProductionStage.options.map(stage => {
      const cards = orders.filter(order => order.productionStage === stage);
      return <section key={stage} aria-label={productionLabels[stage]} className="min-h-72 rounded-xl border border-[#164878] bg-[#061127] p-4">
        <h3 className="mb-4 flex justify-between font-semibold"><span>{productionLabels[stage]}</span><span>{cards.length}</span></h3>
        {!cards.length && <p className="text-sm text-[#9ca3af]">Nenhuma O.S. nesta etapa.</p>}
        <div className="space-y-4">{cards.map(order => <article key={order.id} className="space-y-4 rounded-lg border border-[#0066ff]/40 bg-[#03081a] p-3">
          <Link href={`/admin/orders/${order.id}`} className="font-semibold text-[#60a5fa] underline">O.S. #{order.orderNumber}</Link>
          <ul className="space-y-1 text-sm">{order.items?.map((item, i) => <li key={i}>{item.quantity} × {item.name}{item.size && ` · ${item.size}`}</li>)}</ul>
          <p className="text-xs text-green-300">Pagamento aprovado</p>
          <ProductionForm key={order.productionStage} id={order.id} current={order.productionStage} />
        </article>)}</div>
      </section>;
    })}</div>
  </section>;
}

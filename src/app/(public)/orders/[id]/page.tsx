import Link from 'next/link';
import { requireCustomerOrRedirect } from '@/features/auth/server/guards';
import { fetchOrderMine } from '@/features/orders/server/fetch-order';
import { findCatalogProduct, catalogProducts } from '@/features/products/catalog';
import { formatBRL, formatDate } from '@/shared/lib/format';
import type { Order } from '@/features/orders/schemas';

const steps = ['Realizado', 'Em produção', 'Enviado', 'Entregue'];
const progress: Record<string, number> = { pending: 0, processing: 1, paid: 1, shipped: 2, delivered: 3 };

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
  requireCustomerOrRedirect();

  let order: Order;
  try {
    order = await fetchOrderMine(encodeURIComponent(params.id));
  } catch {
    return <section className="penrose-order-details penrose-order-unavailable"><h1>Pedido indisponível</h1><p>Não foi possível carregar este pedido. Confira o número e tente novamente.</p><Link href="/customer#pedidos">VOLTAR AOS PEDIDOS</Link></section>;
  }

  const currentStep = progress[order.status] ?? 0;
  const canceled = order.status === 'canceled' || order.status === 'refunded';
  const subtotal = order.subtotal;
  const discount = order.discountTotal;

  return <section className="penrose-order-details">
    <header className="penrose-order-intro"><h1>PEDIDO #{order.orderNumber}</h1><p>Realizado em {formatDate(order.createdAt)}</p></header>

    <div className="penrose-order-status">
      <div className="penrose-order-steps">{steps.map((step, index) => <span key={step} className={index <= currentStep && !canceled ? 'active' : ''}><img src={`/assets/penrose/order-step-${index < 2 ? 'complete' : index === 2 ? 'shipped' : 'delivered'}.svg`} alt="" width="10" height="10" />{step}</span>)}</div>
      <div className="penrose-order-progress"><span style={{ width: canceled ? '0%' : `${(currentStep + 1) * 25}%` }} /></div>
      <p>{canceled ? (order.status === 'refunded' ? 'Pedido reembolsado.' : 'Pedido cancelado.') : `Status atual: ${steps[currentStep].toLowerCase()}. Atualizado em ${formatDate(order.updatedAt)}.`}</p>
    </div>

    <div className="penrose-order-main">
      <div className="penrose-order-items">{(order.items ?? []).map((item, index) => {
        const product = findCatalogProduct(item.productId) ?? catalogProducts.find((entry) => entry.name.toLowerCase() === item.name.toLowerCase());
        return <article key={`${item.productId}-${index}`} className="penrose-order-item">
          {product?.images[0] ? <img src={product.images[0]} alt={item.name} width="116" height="116" /> : <div className="penrose-order-image-empty" aria-hidden="true" />}
          <div><h2>{item.name}</h2>{product && <p>{product.sourceCategory}</p>}<small>QUANTIDADE: <b>{item.quantity}</b>{item.size && <> · TAMANHO: <b>{item.size}</b></>}</small></div>
          <strong>{formatBRL(item.unitPrice * item.quantity)}</strong>
        </article>;
      })}
        {!order.items?.length && <p className="penrose-order-no-items">Os itens deste pedido não estão disponíveis no momento.</p>}
      </div>
      <aside className="penrose-order-totals" aria-label="Resumo do pedido"><div><span>Subtotal</span><strong>{formatBRL(subtotal)}</strong></div><div><span>Desconto</span><strong className="discount">− {formatBRL(discount)}</strong></div><div><span>Entrega</span><strong>{order.shippingTotal === 0 ? 'GRÁTIS' : formatBRL(order.shippingTotal)}</strong></div><div className="grand"><span>TOTAL</span><strong>{formatBRL(order.grandTotal)}</strong></div></aside>
    </div>

    <div className="penrose-order-extra">
      <div><h2>Endereço de entrega</h2><p>Endereço não disponível neste pedido.</p></div>
      <div><h2>Pagamento</h2><p>Detalhes do pagamento não disponíveis.</p></div>
      <div><h2>Transportadora</h2><p>{order.status === 'shipped' || order.status === 'delivered' ? 'Consulte o código de rastreio no atendimento.' : 'Informações disponíveis após o envio.'}</p></div>
    </div>
    <div className="penrose-order-actions"><Link href="/shipping/track">ACOMPANHAR ENTREGA</Link><a href="mailto:contato@example.com">PRECISO DE AJUDA</a></div>
  </section>;
}

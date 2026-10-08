import Link from 'next/link';
import { requireCustomerOrRedirect } from '@/features/auth/server/guards';
import { fetchOrderMine } from '@/features/orders/server/fetch-order';
import CancelOrderForm from './form';

export default async function CancelOrderPage({ params }: { params: { id: string } }) {
  requireCustomerOrRedirect();
  const returnUrl = `/orders/${encodeURIComponent(params.id)}`;
  const order = await fetchOrderMine(params.id).catch(() => null);

  if (!order) return <section className="penrose-cancel-page"><div className="penrose-cancel-card"><h1>Pedido não encontrado</h1><Link href="/customer#pedidos">VOLTAR AOS PEDIDOS</Link></div></section>;
  if (!['pending', 'processing', 'paid'].includes(order.status)) return <section className="penrose-cancel-page"><div className="penrose-cancel-card"><h1>Cancelamento indisponível</h1><p>Este pedido não pode ser cancelado por aqui. Se precisar de ajuda, fale com a equipe.</p><Link href={returnUrl}>VOLTAR AO PEDIDO</Link></div></section>;

  return <section className="penrose-cancel-page"><CancelOrderForm orderId={order.id} orderNumber={order.orderNumber} returnUrl={returnUrl} alreadyRequested={Boolean(order.cancellationRequest)} /></section>;
}

import ThankYouClient from './thank-you.client';
import { fetchOrderMine } from '@/features/orders/server/fetch-order';
import { requireCustomerOrRedirect } from '@/features/auth/server/guards';

export const metadata = {
  title: 'Obrigado pela compra | Penrøse',
  description: 'Confirmação de pedido e próximos passos.',
};

export const dynamic = 'force-dynamic';

export default async function ObrigadoPage({ searchParams }: { searchParams: { order?: string } }) {
  requireCustomerOrRedirect();
  const order = searchParams.order ? await fetchOrderMine(searchParams.order).catch(() => null) : null;
  const confirmed = order && ['paid', 'shipped', 'delivered'].includes(order.status);
  return <main><ThankYouClient orderId={confirmed ? order.id : undefined} demo={process.env.COMMERCE_MODE === 'demo'} /></main>;
}

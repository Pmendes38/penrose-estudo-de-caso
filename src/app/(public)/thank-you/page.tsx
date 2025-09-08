import ThankYouClient from './thank-you.client';
import OrderSummary, { OrderSummarySkeleton } from '@/features/orders/components/OrderSummary';

export const metadata = {
  title: 'Obrigado pela compra | Penrøse',
  description: 'Confirmação de pedido e próximos passos.',
};

export const dynamic = 'force-dynamic';

export default async function ObrigadoPage({ searchParams }: { searchParams?: { order?: string } }) {
  const orderId = searchParams?.order || '';

  return (
    <main>
      <ThankYouClient />
      {/* Se tiver orderId, mostra o resumo do pedido logo abaixo */}
      {orderId ? (
        <OrderSummary orderId={orderId} />
      ) : null}
    </main>
  );
}

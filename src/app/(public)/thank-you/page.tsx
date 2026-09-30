import ThankYouClient from './thank-you.client';

export const metadata = {
  title: 'Obrigado pela compra | Penrøse',
  description: 'Confirmação de pedido e próximos passos.',
};

export const dynamic = 'force-dynamic';

export default async function ObrigadoPage({ searchParams }: { searchParams?: { order?: string } }) {
  return (
    <main>
      <ThankYouClient />
    </main>
  );
}

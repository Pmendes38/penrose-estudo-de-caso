import ThankYouClient from './thank-you.client';

export const metadata = {
  title: 'Obrigado pela compra | Penrøse',
  description: 'Confirmação de pedido e próximos passos.',
};

export const dynamic = 'force-dynamic';

export default function ObrigadoPage() {
  return <main><ThankYouClient /></main>;
}

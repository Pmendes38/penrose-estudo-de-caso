import { getCheckoutSession } from './session';
import PaymentClient from './payment.client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PaymentPage() {
  const session = await getCheckoutSession().catch(() => ({}));
  return <PaymentClient session={session} />;
}

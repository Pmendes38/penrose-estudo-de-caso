import { getCheckoutSession } from './session';
import PaymentClient from './payment.client';

export const dynamic = 'force-dynamic';

export default async function PaymentPage() {
  const session = await getCheckoutSession().catch(() => ({}));
  return <PaymentClient session={session} />;
}

import { requireCustomerOrRedirect } from '@/shared/lib/auth.server';
import ClienteClient from './page.client';

export default async function ClientePage() {
  requireCustomerOrRedirect();
  return <ClienteClient />;
}

// app/(public)/customer/page.tsx
import { requireCustomerOrRedirect } from '@/src/lib/auth';
import ClienteClient from './page.client';

export default async function ClientePage() {
  // garante acesso autenticado via cookie/role
  requireCustomerOrRedirect();
  // Poderia buscar dados do usuário/pedidos server-side aqui também.
  return <ClienteClient />;
}

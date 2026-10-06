import { fetchAdminCustomers } from '@/features/customers/server/fetch-customers';
import CustomersTable from './table';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Clientes | PENRØSE ERP' };

export default async function AdminCustomersPage() {
  return <CustomersTable customers={await fetchAdminCustomers()} />;
}

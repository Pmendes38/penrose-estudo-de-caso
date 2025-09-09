import { getAdmin } from '@/features/admins/api';
import EditForm from './ui/EditForm';

export default async function EditAdminPage({ params }: { params: { id: string } }) {
  const admin = await getAdmin(params.id);
  return <EditForm admin={admin} />;
}
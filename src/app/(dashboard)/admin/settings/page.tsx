import { listAdmins } from '@/features/admins/api';
import SettingsWorkspace from './settings-workspace';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const admins = await listAdmins({ page: 1, pageSize: 3 });
  return <SettingsWorkspace admins={admins.items.map(({ id, name }) => ({ id, name }))} adminCount={admins.total} />;
}

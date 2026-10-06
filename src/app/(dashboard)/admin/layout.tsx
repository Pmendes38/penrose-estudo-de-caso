import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { adminPing } from '@/features/auth/api';
import { requireAdminOrRedirect } from '@/shared/lib/auth.server';
import AdminChrome from './AdminChrome';
import '@/app/globals.css';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  requireAdminOrRedirect();
  if (!(await adminPing())) redirect('/login?next=/admin');
  return <AdminChrome>{children}</AdminChrome>;
}

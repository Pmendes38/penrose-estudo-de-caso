import 'server-only';
import { redirect } from 'next/navigation';
import { getAccessToken, getUserRole } from './cookies';

export function requireAdminOrRedirect() {
  if (!getAccessToken() || getUserRole() !== 'admin') redirect('/admin/login');
}

export function requireCustomerOrRedirect() {
  if (!getAccessToken() || getUserRole() !== 'customer') redirect('/login');
}
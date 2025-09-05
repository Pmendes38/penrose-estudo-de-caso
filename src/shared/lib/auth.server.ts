import { cookies } from 'next/headers';

export type UserRole = 'admin' | 'customer';

export function getAccessToken() {
  return cookies().get('accessToken')?.value ?? null;
}

export function getUserRole(): UserRole | null {
  const v = cookies().get('role')?.value;
  if (v === 'admin') return 'admin';
  if (v === 'customer' || v === 'cliente') return 'customer';
  return null;
}

export function isAdmin() {
  return getUserRole() === 'admin';
}

export function isCustomer() {
  return getUserRole() === 'customer';
}

export function requireAdminOrRedirect() {
  const token = getAccessToken();
  const role = getUserRole();
  if (!token || role !== 'admin') {
    const { redirect } = require('next/navigation');
    redirect('/admin/login');
  }
}

export function requireCustomerOrRedirect() {
  const token = getAccessToken();
  const role = getUserRole();
  if (!token || role !== 'customer') {
    const { redirect } = require('next/navigation');
    redirect('/login');
  }
}

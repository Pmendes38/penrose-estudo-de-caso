'use server';

import { redirect } from 'next/navigation';
import { clearAuthCookies } from '@/features/auth/server/cookies';

export async function adminLogoutAction() {
  clearAuthCookies();
  redirect('/login');
}

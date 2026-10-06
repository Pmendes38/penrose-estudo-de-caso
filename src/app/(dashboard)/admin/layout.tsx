import type { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { adminPing } from '@/features/auth/api';
import { requireAdminOrRedirect } from '@/shared/lib/auth.server';
import { Logo } from '@/shared/ui/Logo';
import { userLogoutAction } from './logout/action';
import '@/app/globals.css';

const nav = [
  { name: 'Dashboard', href: '/admin', icon: '▦' },
  { name: 'Produtos', href: '/admin/products', icon: '□' },
  { name: 'Pedidos', href: '/admin/orders', icon: '▤' },
  { name: 'Clientes', href: '/admin/customers', icon: '♙' },
  { name: 'Pagamentos', href: '/admin/payments', icon: '$' },
  { name: 'Cupons', href: '/admin/coupons', icon: '◇' },
  { name: 'Administradores', href: '/admin/admins', icon: '⚙' },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  requireAdminOrRedirect();
  if (!(await adminPing())) redirect('/login?next=/admin');
  return <div className="min-h-screen bg-[#03081a] text-white lg:flex">
    <aside className="border-b border-[#124785] bg-[#060d1f] lg:min-h-screen lg:w-[220px] lg:flex-none lg:border-b-0 lg:border-r">
      <div className="flex h-24 items-center px-6"><Link href="/" aria-label="Voltar à loja"><Logo className="h-auto w-40" /></Link></div>
      <nav aria-label="Administração" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-2 lg:overflow-visible lg:px-0 lg:pb-0">
        {nav.map(item => <Link key={item.href} href={item.href} className="flex shrink-0 items-center gap-4 rounded-lg px-5 py-3 text-sm text-[#b8c3d5] transition hover:bg-[#0b2852] hover:text-white lg:rounded-none lg:border-l-4 lg:border-transparent lg:py-4 lg:hover:border-[#008dff]">
          <span className="w-6 text-center text-xl text-[#008dff]" aria-hidden="true">{item.icon}</span>{item.name}
        </Link>)}
      </nav>
      <div className="hidden px-5 py-8 lg:block"><Link href="/" className="text-sm text-[#8da4c4] hover:text-white">← Voltar à loja</Link><form action={userLogoutAction} className="mt-5"><button type="submit" className="text-sm text-[#8da4c4] hover:text-white">Sair da conta</button></form></div>
    </aside>
    <div className="min-w-0 flex-1">
      <header className="flex min-h-24 items-center justify-between gap-4 border-b border-[#123866] bg-gradient-to-r from-[#081229] to-[#092d54] px-6 py-5 lg:px-10">
        <div><h1 className="text-2xl font-semibold">Dashboard</h1><p className="mt-1 text-sm text-[#aab9d0]">Visão geral do seu negócio</p></div>
        <div className="flex items-center gap-4"><Link href="/admin/products" aria-label="Pesquisar produtos" className="text-2xl text-[#008dff] hover:text-white">⌕</Link><Link href="/admin/orders" aria-label="Ver pedidos" className="text-xl text-[#008dff] hover:text-white">▤</Link><span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#008dff] bg-[#102a52] text-sm" aria-label="Administrador">AD</span></div>
      </header>
      <main className="mx-auto max-w-[1600px] p-6 lg:p-10">{children}</main>
    </div>
  </div>;
}

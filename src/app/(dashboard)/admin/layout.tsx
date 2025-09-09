import React from 'react';
import Link from 'next/link';
import { requireAdminOrRedirect } from '@/shared/lib/auth.server';
import '@/app/globals.css';
import { Logo } from '@/shared/ui/Logo';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  requireAdminOrRedirect();

  const nav = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Produtos', href: '/admin/products', icon: '📦' },
    { name: 'Pedidos', href: '/admin/orders', icon: '🛒' },
    { name: 'Clientes', href: '/admin/customers', icon: '👥' },
    { name: 'Relatórios', href: '/admin/reports', icon: '📈' },
    { name: 'Cupons', href: '/admin/coupons', icon: '🎟️' },
    { name: 'Configurações', href: '/admin/settings', icon: '⚙️' },
  ];

  return (
    <div className="flex h-screen bg-brand-black">
      <aside className="w-64 bg-brand-gray-dark hidden lg:block">
        <div className="h-16 flex items-center justify-center bg-brand-gray-darker">
          <Logo className="h-8" />
        </div>
        <nav className="p-2 space-y-1">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center px-3 py-2 rounded text-brand-gray-light hover:bg-brand-gray">
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">{children}</div>
      </main>
    </div>
  );
}

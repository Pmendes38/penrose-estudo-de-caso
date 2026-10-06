'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/shared/ui/Logo';
import { userLogoutAction } from './logout/action';

const nav = [
  { name: 'Dashboard', href: '/admin', icon: '▦' },
  { name: 'Produtos', href: '/admin/products', icon: '◈' },
  { name: 'Pedidos', href: '/admin/orders', icon: '◉' },
  { name: 'Clientes', href: '', icon: '◎' },
  { name: 'Pagamentos', href: '/admin/payments', icon: '▥' },
  { name: 'Cupons', href: '/admin/coupons', icon: '◇' },
  { name: 'Administradores', href: '/admin/admins', icon: '⚙' },
];

export default function AdminChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const products = pathname.startsWith('/admin/products');
  const page = products ? { title: 'Produtos', description: 'Gerencie catálogo, preços e disponibilidade' } : pathname.startsWith('/admin/orders') ? { title: 'Pedidos', description: 'Acompanhe pagamentos, separação e entregas' } : pathname === '/admin' ? { title: 'Dashboard', description: 'Visão geral do seu negócio' } : { title: nav.find(item => item.href && pathname.startsWith(item.href) && item.href !== '/admin')?.name || 'ERP', description: 'Painel administrativo PENRØSE' };

  return <div className="min-h-screen bg-[#03081a] font-['Instrument_Sans'] text-white lg:flex">
    <aside className="flex-none border-b border-[#06f] bg-[#060d1f] lg:flex lg:min-h-screen lg:w-[220px] lg:flex-col lg:border-b-0 lg:border-r">
      <div className="flex h-24 items-center px-[22px]"><Link href="/" aria-label="Voltar à loja"><Logo className="h-auto w-40" /></Link></div>
      <nav aria-label="Administração" className="flex gap-1 overflow-x-auto px-2 pb-2 lg:block lg:space-y-1 lg:overflow-visible lg:px-0 lg:pb-0">
        {nav.map(item => {
          const active = item.href === '/admin' ? pathname === item.href : !!item.href && pathname.startsWith(item.href);
          const content = <><span aria-hidden="true" className="w-5 text-center">{item.icon}</span>{item.name}</>;
          return item.href ? <Link key={item.name} href={item.href} aria-current={active ? 'page' : undefined} className={`flex h-12 shrink-0 items-center gap-2 rounded-md px-4 text-[15px] lg:rounded-none ${active ? 'bg-[#06204d] font-semibold text-white' : 'text-[#d1d5db] hover:bg-[#0a1d3b] hover:text-white'}`}>{content}</Link> : <span key={item.name} aria-disabled="true" title="Cadastro de clientes em preparação" className="flex h-12 shrink-0 cursor-not-allowed items-center gap-2 px-4 text-[15px] text-[#6b7280]">{content}</span>;
        })}
      </nav>
      <div className="mt-auto hidden px-4 pb-6 pt-8 lg:block"><div className="flex items-start gap-2 text-xs"><span className="mt-1 h-2 w-2 rounded-full bg-[#00e998]" /><div><p>ERP PENRØSE</p><p className="text-[11px] text-[#6b7280]">Acesso administrativo</p></div></div><form action={userLogoutAction} className="mt-5"><button className="text-xs text-[#9ca3af] hover:text-white" type="submit">Sair da conta</button></form></div>
    </aside>
    <div className="min-w-0 flex-1"><header className="flex min-h-24 flex-wrap items-center justify-between gap-4 border-b-2 border-[#06f] bg-gradient-to-r from-[#0b0b0b] via-[#03081a] to-[#052d7a] px-6 py-4 lg:px-8"><div><h1 className="text-[28px] font-bold leading-[34px]">{page.title}</h1><p className="text-sm text-[#9ca3af]">{page.description}</p></div><div className="flex items-center gap-4">{products && pathname === '/admin/products' && <Link href="/admin/products/new" className="flex h-10 items-center gap-2 rounded-md bg-[#06f] px-4 text-[13px] font-semibold hover:bg-[#2780ff]"><img src="/assets/admin/plus.svg" alt="" width="16" height="16" />Novo Produto</Link>}{pathname === '/admin/orders' && <button type="button" disabled title="Criação manual de pedido ainda não disponível" className="flex h-10 items-center gap-2 rounded-md border border-white/15 bg-[#071127] px-4 text-[13px] text-[#9ca3af] opacity-70"><img src="/assets/admin/plus.svg" alt="" width="16" height="16" />Criar pedido</button>}<Link href={pathname === '/admin/orders' ? '/admin/orders' : '/admin/products#product-search'} aria-label={pathname === '/admin/orders' ? 'Ver pedidos' : 'Buscar produtos'} className="flex h-12 w-12 items-center justify-center rounded-md hover:bg-white/10"><img src="/assets/admin/search.svg" alt="" width="18" height="18" /></Link><Link href="/" aria-label="Abrir loja" className="flex h-12 w-12 items-center justify-center rounded-md text-[#06f] hover:bg-white/10"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M6 8h12l1 13H5L6 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg></Link><img src="/assets/admin/profile.png" alt="Perfil do administrador" width="52" height="52" className="rounded-full" /></div></header><main className="p-6 lg:p-8">{children}</main></div>
  </div>;
}

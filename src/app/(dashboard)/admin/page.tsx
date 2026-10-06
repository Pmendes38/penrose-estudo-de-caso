import Link from 'next/link';
import { fetchWithAuth } from '@/features/auth/server/fetch-with-auth';
import { envServer } from '@/shared/lib/env.server';
import { listOrdersAdmin } from '@/features/orders/api';

export const dynamic = 'force-dynamic';
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

async function getProducts() {
  const response = await fetchWithAuth(`${envServer.NEXT_PUBLIC_API_BASE_URL}/api/v1/admin/products?page=1&pageSize=3`);
  if (!response.ok) throw new Error('Não foi possível consultar os produtos');
  return response.json() as Promise<{ total: number; items: { id: string; name: string; createdAt?: string }[] }>;
}

async function getOrders() {
  const first = await listOrdersAdmin({ page: 1, pageSize: 100 });
  const items = [...first.items];
  // ponytail: percorre as páginas existentes; criar endpoint agregado quando o volume exigir.
  for (let page = 2; page <= first.pages; page++) {
    items.push(...(await listOrdersAdmin({ page, pageSize: 100 })).items);
  }
  return items;
}

export default async function AdminDashboard() {
  const [productsResult, ordersResult] = await Promise.allSettled([getProducts(), getOrders()]);
  const products = productsResult.status === 'fulfilled' ? productsResult.value : null;
  const orders = ordersResult.status === 'fulfilled' ? ordersResult.value : null;
  const now = new Date();
  const monthlyOrders = orders?.filter(order => order.createdAt.getFullYear() === now.getFullYear() && order.createdAt.getMonth() === now.getMonth());
  const revenue = monthlyOrders?.filter(order => ['paid', 'shipped', 'delivered'].includes(order.status)).reduce((sum, order) => sum + order.grandTotal, 0);
  const customerCount = orders ? new Set(orders.map(order => order.customerId)).size : null;
  const cards = [
    { label: 'Total de Produtos', value: products?.total ?? '—', href: '/admin/products', link: 'Ver todos os produtos', icon: '□', color: 'text-[#b47aff]' },
    { label: 'Pedidos do Mês', value: monthlyOrders?.length ?? '—', href: '/admin/orders', link: 'Ver todos os pedidos', icon: '▤', color: 'text-[#008dff]' },
    { label: 'Clientes com Pedidos', value: customerCount ?? '—', href: '/admin/orders', link: 'Ver pedidos', icon: '♙', color: 'text-[#00e999]' },
    { label: 'Receita Mensal', value: revenue === undefined ? '—' : money.format(revenue), href: '/admin/orders', link: 'Ver pedidos', icon: '$', color: 'text-[#ffbd66]' },
  ];
  const actions = [
    { name: 'Novo Produto', description: 'Adicione uma nova peça', href: '/admin/products/new', icon: '+', color: 'from-[#7222c2] to-[#b05cec]' },
    { name: 'Ver Pedidos', description: 'Acompanhe suas vendas', href: '/admin/orders', icon: '▤', color: 'from-[#064f9f] to-[#067df2]' },
    { name: 'Pagamentos', description: 'Confira as transações', href: '/admin/payments', icon: '$', color: 'from-[#087362] to-[#06b59b]' },
    { name: 'Cupons', description: 'Gerencie as promoções', href: '/admin/coupons', icon: '◇', color: 'from-[#5f4b20] to-[#b88835]' },
  ];
  const activity = [
    ...(products?.items ?? []).filter(item => item.createdAt).map(item => ({ id: `product-${item.id}`, label: `Novo produto adicionado: ${item.name}`, date: new Date(item.createdAt!), href: '/admin/products', icon: '□' })),
    ...(orders ?? []).slice(0, 5).map(order => ({ id: `order-${order.id}`, label: `Pedido #${order.orderNumber} recebido`, date: order.createdAt, href: `/admin/orders/${order.id}`, icon: '▤' })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  return <div className="space-y-10 text-white">
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">{cards.map(card => <div key={card.label} className="overflow-hidden rounded-xl border border-[#123866] bg-[#091932]">
      <div className="flex min-h-36 items-start gap-5 p-6"><span className={`text-4xl ${card.color}`} aria-hidden="true">{card.icon}</span><div><p className="text-sm text-[#aab9d0]">{card.label}</p><p className="mt-2 text-3xl font-semibold">{card.value}</p></div></div>
      <Link href={card.href} className="block border-t border-[#123866] bg-[#0b2141] px-6 py-3 text-sm text-[#62b7ff] hover:text-white">{card.link} →</Link>
    </div>)}</div>
    <section><h2 className="mb-5 text-2xl font-medium">Ações Rápidas</h2><div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">{actions.map(action => <Link key={action.name} href={action.href} className={`group rounded-xl border border-white/10 bg-gradient-to-br ${action.color} p-6 transition hover:brightness-125`}><span className="text-4xl" aria-hidden="true">{action.icon}</span><h3 className="mt-7 text-lg font-semibold">{action.name} <span className="float-right transition group-hover:translate-x-1">→</span></h3><p className="mt-1 text-sm text-white/80">{action.description}</p></Link>)}</div></section>
    <section><h2 className="mb-5 text-2xl font-medium">Atividade Recente</h2><div className="rounded-xl border border-[#123866] bg-[#091932] px-6">{activity.length ? activity.map(item => <Link href={item.href} key={item.id} className="flex items-center gap-5 border-b border-[#123866] py-5 last:border-0 hover:text-[#62b7ff]"><span className="text-2xl text-[#008dff]" aria-hidden="true">{item.icon}</span><span className="flex-1">{item.label}</span><time className="text-sm text-[#aab9d0]" dateTime={item.date.toISOString()}>{item.date.toLocaleDateString('pt-BR')}</time></Link>) : <p className="py-6 text-[#aab9d0]">Nenhuma atividade disponível.</p>}</div></section>
  </div>;
}

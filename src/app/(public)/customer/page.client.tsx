// app/(public)/customer/page.client.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatBRL, formatDate } from '@/src/shared/lib/format';

type OrderItem = { name: string; size?: string; price: number; image?: string };
type Order = { id: string; date: string; status: string; total: number; items: OrderItem[] };

export default function ClienteClient() {
  const [user, setUser] = useState<{ name: string; email: string; phone?: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // troque por /api/me + /api/orders/me
    setUser({ name: 'João Silva', email: 'contato@example.com', phone: '(11) 99999-999'})
    setOrders([
      {
        id: '1234',
        date: '2025-01-15',
        status: 'processing',
        total: 529.9,
        items: [{ name: 'Venom: Simbionte Dominador', size: '20 cm', price: 529.9, image: '/assets/products/venom/venom-1.jpg' }],
      },
      {
        id: '1235',
        date: '2025-01-10',
        status: 'delivered',
        total: 250,
        items: [{ name: 'Soldado Invernal - Bucky Barnes', size: '20 cm', price: 250, image: '/assets/products/soldadoinvernal/bucky-1.jpg' }],
      },
    ]);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
          <p className="text-brand-gray-light">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const label = (status: string) =>
    ({
      pending: ['Pendente', 'bg-yellow-900/50 text-yellow-200'],
      processing: ['Processando', 'bg-blue-900/50 text-blue-200'],
      shipped: ['Enviado', 'bg-green-900/50 text-green-200'],
      delivered: ['Entregue', 'bg-green-900/50 text-green-200'],
      cancelled: ['Cancelado', 'bg-red-900/50 text-red-200'],
    }[status] ?? [status, 'bg-gray-900/50 text-gray-200']);

  return (
    <div className="min-h-screen bg-brand-black">
      <header className="bg-brand-gray-dark border-b border-brand-gray-border">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/"><img src="/assets/WIDE LOGO.svg" alt="PENROSE" className="h-8 w-auto" /></Link>
            <h1 className="text-xl font-bold text-brand-gray-light">Minha Conta</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-brand-gray-light hover:text-white">🏠 Voltar à Loja</Link>
            <a href="/logout" className="text-red-400 hover:text-red-300">🚪 Sair</a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <aside className="lg:col-span-1">
          <div className="bg-brand-gray-dark rounded-lg p-6 border border-brand-gray-border">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-brand-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">👤</span>
              </div>
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <p className="text-brand-gray">{user.email}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-brand-gray-light">Telefone</label>
                <p className="text-white">{user.phone ?? 'Não informado'}</p>
              </div>
            </div>
            <button className="w-full mt-6 bg-brand-blue hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg">
              ✏️ Editar Perfil
            </button>
          </div>
        </aside>

        <section className="lg:col-span-2">
          <div className="bg-brand-gray-dark rounded-lg border border-brand-gray-border">
            <div className="px-6 py-4 border-b border-brand-gray-border">
              <h3 className="text-xl font-bold text-white">Meus Pedidos ({orders.length})</h3>
            </div>

            {orders.length ? (
              <div className="divide-y divide-brand-gray-border">
                {orders.map((order) => {
                  const [lab, cls] = label(order.status);
                  return (
                    <div key={order.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-white">Pedido #{order.id}</h4>
                          <p className="text-brand-gray text-sm">{formatDate(order.date)}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${cls}`}>
                          {lab}
                        </span>
                      </div>

                      <div className="space-y-3 mb-4">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex items-center gap-4">
                            <img
                              src={it.image ?? '/assets/placeholder.jpg'}
                              alt={it.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h5 className="text-white font-medium">{it.name}</h5>
                              {it.size && <p className="text-brand-gray text-sm">Tamanho: {it.size}</p>}
                            </div>
                            <div className="text-right">
                              <p className="text-brand-blue font-semibold">{formatBRL(it.price)}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-brand-gray-border">
                        <p className="text-lg font-bold text-white">Total: {formatBRL(order.total)}</p>
                        <div className="flex gap-2">
                          <button className="text-brand-gray hover:text-brand-gray-light text-sm font-medium px-3 py-1 rounded">
                            👁️ Ver Detalhes
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-brand-gray-light mb-2">
                  Nenhum pedido encontrado
                </h3>
                <p className="text-brand-gray mb-6">Você ainda não fez nenhum pedido.</p>
                <Link
                  href="/#catalogo"
                  className="bg-brand-blue hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg"
                >
                  🛒 Fazer Primeira Compra
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

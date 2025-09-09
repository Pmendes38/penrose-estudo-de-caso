'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalClients: 0,
    monthlyRevenue: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Simular dados do dashboard
        setTimeout(() => {
          setStats({
            totalProducts: 12,
            totalOrders: 45,
            totalClients: 28,
            monthlyRevenue: 15750.00
          });
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const quickActions = [
    { name: 'Novo Produto', href: '/admin/products/new', icon: '➕', color: 'bg-green-600' },
    { name: 'Ver Pedidos', href: '/admin/orders', icon: '📋', color: 'bg-blue-600' },
    { name: 'Relatórios', href: '/admin/reports', icon: '📊', color: 'bg-purple-600' },
    { name: 'Configurações', href: '/admin/settings', icon: '⚙️', color: 'bg-gray-600' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-brand-gray-dark rounded-lg p-5">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold leading-7 text-brand-gray-light sm:text-3xl sm:truncate">
          Dashboard
        </h2>
        <p className="mt-1 text-sm text-brand-gray">
          Visão geral do seu negócio
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-brand-gray-dark overflow-hidden rounded-lg border border-brand-gray-border">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 text-2xl">📦</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-brand-gray truncate">
                    Total de Produtos
                  </dt>
                  <dd className="text-lg font-medium text-brand-gray-light">
                    {stats.totalProducts}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-brand-gray px-5 py-3">
            <div className="text-sm">
              <Link href="/admin/products" className="font-medium text-brand-blue hover:text-blue-400 transition-colors">
                Ver todos produtos
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-brand-gray-dark overflow-hidden rounded-lg border border-brand-gray-border">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 text-2xl">🛒</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-brand-gray truncate">
                    Pedidos do Mês
                  </dt>
                  <dd className="text-lg font-medium text-brand-gray-light">
                    {stats.totalOrders}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-brand-gray px-5 py-3">
            <div className="text-sm">
              <Link href="/admin/orders" className="font-medium text-brand-blue hover:text-blue-400 transition-colors">
                Ver todos pedidos
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-brand-gray-dark overflow-hidden rounded-lg border border-brand-gray-border">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 text-2xl">👥</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-brand-gray truncate">
                    Total de Clientes
                  </dt>
                  <dd className="text-lg font-medium text-brand-gray-light">
                    {stats.totalClients}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-brand-gray px-5 py-3">
            <div className="text-sm">
              <Link href="/admin/customers" className="font-medium text-brand-blue hover:text-blue-400 transition-colors">
                Ver todos clientes
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-brand-gray-dark overflow-hidden rounded-lg border border-brand-gray-border">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 text-2xl">💰</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-brand-gray truncate">
                    Receita Mensal
                  </dt>
                  <dd className="text-lg font-medium text-brand-gray-light">
                    R$ {stats.monthlyRevenue.toFixed(2).replace('.', ',')}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-brand-gray px-5 py-3">
            <div className="text-sm">
              <Link href="/admin/reports" className="font-medium text-brand-blue hover:text-blue-400 transition-colors">
                Ver relatórios
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg leading-6 font-medium text-brand-gray-light mb-4">
          Ações Rápidas
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className="relative group bg-brand-gray-dark p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-brand-blue rounded-lg border border-brand-gray-border hover:bg-brand-gray transition-colors"
            >
              <div>
                <span className={`rounded-lg inline-flex p-3 text-white text-2xl ${action.color}`}>
                  {action.icon}
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-brand-gray-light">
                  {action.name}
                </h3>
              </div>
              <span className="pointer-events-none absolute top-6 right-6 text-brand-gray group-hover:text-brand-gray-light transition-colors" aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg leading-6 font-medium text-brand-gray-light mb-4">
          Atividade Recente
        </h3>
        <div className="bg-brand-gray-dark border border-brand-gray-border rounded-lg">
          <div className="p-6">
            <div className="flow-root">
              <ul className="divide-y divide-brand-gray-border">
                <li className="py-3">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 text-2xl">
                      📦
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-brand-gray-light truncate">
                        Novo produto adicionado: Venom Simbionte
                      </p>
                      <p className="text-sm text-brand-gray">
                        2 horas atrás
                      </p>
                    </div>
                  </div>
                </li>
                <li className="py-3">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 text-2xl">
                      🛒
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-brand-gray-light truncate">
                        Novo pedido #1234 recebido
                      </p>
                      <p className="text-sm text-brand-gray">
                        4 horas atrás
                      </p>
                    </div>
                  </div>
                </li>
                <li className="py-3">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 text-2xl">
                      👤
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-brand-gray-light truncate">
                        Novo cliente cadastrado
                      </p>
                      <p className="text-sm text-brand-gray">
                        1 dia atrás
                      </p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
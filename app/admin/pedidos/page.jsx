'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminPedidos() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError('');
      try {
        const token =
          typeof window !== 'undefined'
            ? localStorage.getItem('adminToken') || localStorage.getItem('authToken')
            : null;

  const res = await fetch('/api/orders/admin', {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (res.status === 401 || res.status === 403) {
          setError('Não autorizado. Faça login novamente.');
          setOrders([]);
          setIsLoading(false);
          return;
        }

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || 'Erro ao buscar pedidos');
        }

        const data = await res.json();
        // O backend retorna um array de pedidos do Supabase
        const mapped = (Array.isArray(data) ? data : []).map((o) => ({
          id: o.id,
          customer: o.shipping?.address?.name || 'Cliente',
          email: o.shipping?.address?.email || '-',
          total: o.total_amount || 0,
          status: o.status || 'pending',
          date: o.created_at || new Date().toISOString(),
          items: Array.isArray(o.items) ? o.items.length : 0,
        }));
        setOrders(mapped);
      } catch (err) {
        console.error('Erro ao carregar pedidos:', err);
        setError(err.message || 'Erro ao carregar pedidos');
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    const prev = orders;
    // Otimista
    setOrders((curr) => curr.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('adminToken') || localStorage.getItem('authToken')
          : null;
  const res = await fetch(`/api/orders/admin/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.status === 401 || res.status === 403) {
        setError('Não autorizado. Faça login novamente.');
        setOrders(prev);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Erro ao atualizar status');
      }
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      setError(err.message || 'Erro ao atualizar status');
      // Reverte
      setOrders(prev);
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      pending: { label: 'Pendente', color: 'bg-yellow-900/50 text-yellow-200' },
      processing: { label: 'Processando', color: 'bg-blue-900/50 text-blue-200' },
      shipped: { label: 'Enviado', color: 'bg-green-900/50 text-green-200' },
      delivered: { label: 'Entregue', color: 'bg-green-900/50 text-green-200' },
      cancelled: { label: 'Cancelado', color: 'bg-red-900/50 text-red-200' }
    };
    return statusMap[status] || { label: status, color: 'bg-gray-900/50 text-gray-200' };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-brand-gray-light">Pedidos</h2>
        </div>
        
        <div className="bg-brand-gray-dark rounded-lg border border-brand-gray-border">
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/3"></div>
                </div>
                <div className="w-20 h-4 bg-gray-700 rounded"></div>
                <div className="w-16 h-6 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-brand-gray-light">Pedidos</h2>
          <p className="mt-1 text-sm text-brand-gray">
            Gerencie todos os pedidos do sistema
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/40 border border-red-600 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Buscar por ID do pedido ou cliente..."
          className="flex-1 bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-2 px-4 rounded-lg focus:outline-none focus:border-brand-blue"
        />
        <select className="bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-2 px-4 rounded-lg focus:outline-none focus:border-brand-blue">
          <option value="">Todos os status</option>
          <option value="pending">Pendente</option>
          <option value="processing">Processando</option>
          <option value="shipped">Enviado</option>
          <option value="delivered">Entregue</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>

      {/* Lista de Pedidos */}
      <div className="bg-brand-gray-dark rounded-lg border border-brand-gray-border">
        <div className="px-6 py-4 border-b border-brand-gray-border">
          <h3 className="text-lg font-medium text-brand-gray-light">
            Pedidos Recentes ({orders.length})
          </h3>
        </div>
        
        <div className="divide-y divide-brand-gray-border">
          {orders.map((order) => {
            const statusInfo = getStatusLabel(order.status);
            return (
              <div key={order.id} className="p-6 hover:bg-brand-gray/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h4 className="text-lg font-medium text-brand-gray-light">
                          Pedido #{String(order.id)}
                        </h4>
                        <p className="text-sm text-brand-gray">
                          {order.customer} • {order.email}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-brand-blue font-semibold">
                            R$ {order.total.toFixed(2).replace('.', ',')}
                          </span>
                          <span className="text-sm text-brand-gray">
                            {order.items} {order.items === 1 ? 'item' : 'itens'}
                          </span>
                          <span className="text-sm text-brand-gray">
                            {new Date(order.date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                    
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="text-brand-blue hover:text-blue-400 px-3 py-1 rounded transition-colors"
                      >
                        👁️ Ver Detalhes
                      </Link>
                      
                      <select 
                        className="bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-1 px-2 rounded text-sm focus:outline-none focus:border-brand-blue"
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      >
                        <option value="pending">Pendente</option>
                        <option value="processing">Processando</option>
                        <option value="shipped">Enviado</option>
                        <option value="delivered">Entregue</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {orders.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-brand-gray-light mb-2">
              Nenhum pedido encontrado
            </h3>
            <p className="text-brand-gray">
              Os pedidos aparecerão aqui quando forem realizados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
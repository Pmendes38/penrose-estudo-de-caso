'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ClientePage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const role = localStorage.getItem('userRole');
      
      if (!token || role !== 'cliente') {
        router.push('/login');
        return;
      }
      
      // Simular dados do usuário
      setUser({
        name: 'João Silva',
        email: 'contato@example.com',
        phone: '(00) 00000-0000'
      });
      
      // Simular pedidos
      setOrders([
        {
          id: '1234',
          date: '2025-01-15',
          status: 'processing',
          total: 529.90,
          items: [
            {
              name: 'Venom: Simbionte Dominador',
              size: '20 cm',
              price: 529.90,
              image: '/assets/products/venom/venom-1.jpg'
            }
          ]
        },
        {
          id: '1235',
          date: '2025-01-10',
          status: 'delivered',
          total: 250.00,
          items: [
            {
              name: 'Soldado Invernal - Bucky Barnes',
              size: '20 cm',
              price: 250.00,
              image: '/assets/products/soldadoinvernal/bucky-1.jpg'
            }
          ]
        }
      ]);
      
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    router.push('/login');
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
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
          <p className="text-brand-gray-light">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black">
      {/* Header */}
      <header className="bg-brand-gray-dark border-b border-brand-gray-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/">
                <img 
                  src="/assets/WIDE LOGO.svg" 
                  alt="Logo da PENROSE" 
                  className="h-8 w-auto cursor-pointer"
                />
              </Link>
              <h1 className="ml-4 text-xl font-bold text-brand-gray-light">
                Minha Conta
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-brand-gray-light hover:text-white transition-colors"
              >
                🏠 Voltar à Loja
              </Link>
              <button
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                🚪 Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Informações do Cliente */}
          <div className="lg:col-span-1">
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
                  <label className="block text-sm font-medium text-brand-gray-light mb-1">
                    Nome
                  </label>
                  <p className="text-white">{user.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-brand-gray-light mb-1">
                    E-mail
                  </label>
                  <p className="text-white">{user.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-brand-gray-light mb-1">
                    Telefone
                  </label>
                  <p className="text-white">{user.phone || 'Não informado'}</p>
                </div>
              </div>
              
              <button className="w-full mt-6 bg-brand-blue hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                ✏️ Editar Perfil
              </button>
            </div>
          </div>

          {/* Main Content - Pedidos */}
          <div className="lg:col-span-2">
            <div className="bg-brand-gray-dark rounded-lg border border-brand-gray-border">
              <div className="px-6 py-4 border-b border-brand-gray-border">
                <h3 className="text-xl font-bold text-white">
                  Meus Pedidos ({orders.length})
                </h3>
              </div>
              
              {orders.length > 0 ? (
                <div className="divide-y divide-brand-gray-border">
                  {orders.map((order) => {
                    const statusInfo = getStatusLabel(order.status);
                    return (
                      <div key={order.id} className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-white">
                              Pedido #{order.id}
                            </h4>
                            <p className="text-brand-gray text-sm">
                              {new Date(order.date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        
                        <div className="space-y-3 mb-4">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center space-x-4">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <h5 className="text-white font-medium">{item.name}</h5>
                                <p className="text-brand-gray text-sm">Tamanho: {item.size}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-brand-blue font-semibold">
                                  R$ {item.price.toFixed(2).replace('.', ',')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-brand-gray-border">
                          <div>
                            <p className="text-lg font-bold text-white">
                              Total: R$ {order.total.toFixed(2).replace('.', ',')}
                            </p>
                          </div>
                          
                          <div className="flex space-x-2">
                            {order.status === 'shipped' && (
                              <button className="text-brand-blue hover:text-blue-400 text-sm font-medium px-3 py-1 rounded transition-colors">
                                📦 Rastrear Pedido
                              </button>
                            )}
                            <button className="text-brand-gray hover:text-brand-gray-light text-sm font-medium px-3 py-1 rounded transition-colors">
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
                  <p className="text-brand-gray mb-6">
                    Você ainda não fez nenhum pedido conosco.
                  </p>
                  <Link
                    href="/#catalogo"
                    className="bg-brand-blue hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors inline-block"
                  >
                    🛒 Fazer Primeira Compra
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
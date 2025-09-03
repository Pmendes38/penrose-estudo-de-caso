'use client';

import React, { useState, useEffect } from 'react';

export default function AdminClientes() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setTimeout(() => {
          setClients([
            {
              id: '1',
              name: 'João Silva',
              email: 'contato@example.com',
              phone: '(00) 00000-0000',
              totalOrders: 3,
              totalSpent: 1299.70,
              lastOrder: '2025-01-15',
              status: 'active'
            },
            {
              id: '2',
              name: 'Maria Santos',
              email: 'contato@example.com',
              phone: '(00) 00000-0000',
              totalOrders: 1,
              totalSpent: 250.00,
              lastOrder: '2025-01-14',
              status: 'active'
            }
          ]);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-brand-gray-light">Clientes</h2>
        <div className="bg-brand-gray-dark rounded-lg border border-brand-gray-border p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-brand-gray-light">Clientes</h2>
        <p className="mt-1 text-sm text-brand-gray">
          Gerencie todos os clientes do sistema
        </p>
      </div>

      <div className="bg-brand-gray-dark rounded-lg border border-brand-gray-border">
        <div className="px-6 py-4 border-b border-brand-gray-border">
          <h3 className="text-lg font-medium text-brand-gray-light">
            Lista de Clientes ({clients.length})
          </h3>
        </div>
        
        <div className="divide-y divide-brand-gray-border">
          {clients.map((client) => (
            <div key={client.id} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-medium text-brand-gray-light">
                    {client.name}
                  </h4>
                  <p className="text-sm text-brand-gray">{client.email}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm text-brand-gray">
                      {client.totalOrders} pedidos
                    </span>
                    <span className="text-brand-blue font-semibold">
                      R$ {client.totalSpent.toFixed(2).replace('.', ',')} gastos
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className="px-3 py-1 bg-green-900/50 text-green-200 rounded-full text-sm font-medium">
                    Ativo
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
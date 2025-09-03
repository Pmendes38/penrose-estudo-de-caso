'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
      const role = localStorage.getItem('userRole');
      
      if (!token || role !== 'admin') {
        router.push('/admin/login');
        return;
      }
      
      setIsAuthenticated(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    router.push('/admin/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Produtos', href: '/admin/produtos', icon: '📦' },
    { name: 'Pedidos', href: '/admin/pedidos', icon: '🛒' },
    { name: 'Clientes', href: '/admin/clientes', icon: '👥' },
    { name: 'Relatórios', href: '/admin/relatorios', icon: '📈' },
    { name: 'Cupons', href: '/admin/cupons', icon: '🎟️' },
    { name: 'Configurações', href: '/admin/configuracoes', icon: '⚙️' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
          <p className="text-brand-gray-light">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-brand-black">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-brand-gray-dark transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-center h-16 bg-brand-gray-darker">
          <img 
            src="/assets/WIDE LOGO.svg" 
            alt="Logo da PENROSE" 
            className="h-8 w-auto"
          />
        </div>
        
        <nav className="mt-5 px-2">
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  pathname === item.href
                    ? 'bg-brand-blue text-white'
                    : 'text-brand-gray-light hover:bg-brand-gray hover:text-white'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-0 w-full p-2">
          <button
            onClick={handleLogout}
            className="group flex items-center w-full px-2 py-2 text-sm font-medium text-brand-gray-light rounded-md hover:bg-red-600 hover:text-white transition-colors"
          >
            <span className="mr-3 text-lg">🚪</span>
            Sair
          </button>
        </div>
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden lg:ml-0">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-brand-gray-dark shadow lg:border-none border-b border-brand-gray-border">
          <button
            className="px-4 border-r border-brand-gray-border text-brand-gray-light focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-blue lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Abrir sidebar</span>
            ☰
          </button>
          
          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex-1 flex">
              <h1 className="text-xl font-semibold text-brand-gray-light">
                Painel Administrativo
              </h1>
            </div>
            
            <div className="ml-4 flex items-center md:ml-6">
              <Link
                href="/"
                className="text-brand-gray-light hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Ver Site
              </Link>
            </div>
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
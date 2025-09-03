'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext.jsx';

export default function CarrinhoPage() {
  const router = useRouter();
  const { items, total, itemCount, isClient } = useCart();

  // Renderização segura para SSR
  if (!isClient) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
          <p className="text-brand-gray-light">Carregando carrinho...</p>
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
              <img 
                src="/assets/WIDE LOGO.svg" 
                alt="Logo da PENROSE" 
                className="h-8 w-auto cursor-pointer"
                onClick={() => router.push('/')}
              />
              <h1 className="ml-4 text-xl font-bold text-brand-gray-light">
                Carrinho de Compras
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-brand-gray-light hover:text-white transition-colors"
              >
                ← Voltar às Compras
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-3xl font-bold text-brand-gray-light mb-4">
              Seu carrinho está vazio
            </h2>
            <p className="text-brand-gray mb-8">
              Adicione alguns produtos para começar suas compras!
            </p>
            <Link
              href="/#catalogo"
              className="bg-brand-blue hover:bg-blue-600 text-brand-black font-semibold px-8 py-4 rounded-lg transition-colors text-lg"
            >
              Ver Produtos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de Produtos */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-brand-gray-light mb-6">
                Produtos no Carrinho ({itemCount})
              </h2>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="bg-brand-gray-dark border border-brand-gray-border rounded-lg p-6">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={item.mainImage || '/placeholder.jpg'} 
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-brand-gray-light">
                          {item.name}
                        </h3>
                        <p className="text-brand-gray">
                          Tamanho: {item.selectedSize}
                        </p>
                        <p className="text-brand-blue font-semibold">
                          R$ {item.price?.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-brand-gray-light font-semibold">
                          Qtd: {item.quantity}
                        </p>
                        <p className="text-brand-blue font-bold">
                          R$ {(item.price * item.quantity)?.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumo do Pedido */}
            <div className="lg:col-span-1">
              <div className="bg-brand-gray-dark border border-brand-gray-border rounded-lg p-6 sticky top-24">
                <h3 className="text-xl font-bold text-brand-gray-light mb-4">
                  Resumo do Pedido
                </h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-brand-gray">Subtotal:</span>
                    <span className="text-brand-gray-light">R$ {total?.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-gray">Frete:</span>
                    <span className="text-brand-gray-light">Calculando...</span>
                  </div>
                  <div className="border-t border-brand-gray-border pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-brand-gray-light">Total:</span>
                      <span className="text-lg font-bold text-brand-blue">
                        R$ {total?.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="w-full bg-brand-blue hover:bg-blue-600 text-brand-black font-bold py-4 px-6 rounded-lg transition-colors text-lg">
                  Finalizar Compra
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
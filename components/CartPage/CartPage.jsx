'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, calculateTotal } = useCart();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = () => {
    if (items.length === 0) {
      alert('Seu carrinho está vazio');
      return;
    }
    router.push('/checkout');
  };

  const handleRemoveItem = (itemId) => {
    removeItem(itemId);
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Seu carrinho está vazio</h1>
            <p className="text-gray-600 mb-8">Adicione alguns produtos para começar suas compras</p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Continuar comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Seu Carrinho</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de itens */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              {items.map((item) => (
                <div key={item.id} className="p-6 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                      <p className="text-gray-600">Tamanho: {item.size}</p>
                      <p className="text-lg font-semibold text-indigo-600">
                        R$ {item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="w-12 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-between items-center">
              <button
                onClick={clearCart}
                className="text-red-600 hover:text-red-800 font-medium"
              >
                Limpar carrinho
              </button>
              <Link
                href="/"
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Continuar comprando
              </Link>
            </div>
          </div>

          {/* Resumo do pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Pedido</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({items.length} itens)</span>
                  <span className="font-medium">R$ {calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frete</span>
                  <span className="text-green-600">Grátis</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-lg font-semibold text-indigo-600">
                      R$ {calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading || items.length === 0}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processando...' : 'Finalizar Compra'}
              </button>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Ao finalizar, você será redirecionado para o checkout seguro
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
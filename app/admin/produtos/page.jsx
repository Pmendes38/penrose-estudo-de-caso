'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminProdutos() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Simular carregamento de produtos
        setTimeout(() => {
          setProducts([
            {
              id: '1',
              name: 'Venom: Simbionte Dominador',
              category: 'Marvel',
              price: 529.90,
              status: 'active',
              stock: 5,
              image: '/assets/products/venom/venom-1.jpg'
            },
            {
              id: '2',
              name: 'Soldado Invernal - Bucky Barnes',
              category: 'Marvel',
              price: 250.00,
              status: 'active',
              stock: 3,
              image: '/assets/products/soldadoinvernal/bucky-1.jpg'
            },
            {
              id: '3',
              name: 'Escanor O Leão do Orgulho',
              category: 'Anime',
              price: 229.90,
              status: 'active',
              stock: 2,
              image: '/assets/products/escanor/escanor-1.jpg'
            }
          ]);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-brand-gray-light">Produtos</h2>
          <div className="h-10 w-32 bg-gray-700 rounded animate-pulse"></div>
        </div>
        
        <div className="bg-brand-gray-dark rounded-lg border border-brand-gray-border">
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="w-16 h-16 bg-gray-700 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/6"></div>
                </div>
                <div className="w-20 h-4 bg-gray-700 rounded"></div>
                <div className="w-16 h-4 bg-gray-700 rounded"></div>
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
          <h2 className="text-2xl font-bold text-brand-gray-light">Produtos</h2>
          <p className="mt-1 text-sm text-brand-gray">
            Gerencie seu catálogo de produtos
          </p>
        </div>
        <Link
          href="/admin/produtos/novo"
          className="bg-brand-blue hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center"
        >
          ➕ Novo Produto
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Buscar produtos..."
          className="flex-1 bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-2 px-4 rounded-lg focus:outline-none focus:border-brand-blue"
        />
        <select className="bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-2 px-4 rounded-lg focus:outline-none focus:border-brand-blue">
          <option value="">Todas as categorias</option>
          <option value="marvel">Marvel</option>
          <option value="anime">Anime</option>
          <option value="dc">DC</option>
        </select>
        <select className="bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-2 px-4 rounded-lg focus:outline-none focus:border-brand-blue">
          <option value="">Todos os status</option>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
        </select>
      </div>

      {/* Lista de Produtos */}
      <div className="bg-brand-gray-dark rounded-lg border border-brand-gray-border">
        <div className="px-6 py-4 border-b border-brand-gray-border">
          <h3 className="text-lg font-medium text-brand-gray-light">
            Lista de Produtos ({products.length})
          </h3>
        </div>
        
        <div className="divide-y divide-brand-gray-border">
          {products.map((product) => (
            <div key={product.id} className="p-6 hover:bg-brand-gray/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="text-lg font-medium text-brand-gray-light">
                      {product.name}
                    </h4>
                    <p className="text-sm text-brand-gray">
                      {product.category}
                    </p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-brand-blue font-semibold">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.status === 'active' 
                          ? 'bg-green-900/50 text-green-200' 
                          : 'bg-red-900/50 text-red-200'
                      }`}>
                        {product.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                      <span className="text-sm text-brand-gray">
                        Estoque: {product.stock}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/admin/produtos/editar/${product.id}`}
                    className="text-brand-blue hover:text-blue-400 px-3 py-1 rounded transition-colors"
                  >
                    ✏️ Editar
                  </Link>
                  <Link
                    href={`/produto/${product.id}`}
                    target="_blank"
                    className="text-brand-gray hover:text-brand-gray-light px-3 py-1 rounded transition-colors"
                  >
                    👁️ Ver
                  </Link>
                  <button
                    className="text-red-400 hover:text-red-300 px-3 py-1 rounded transition-colors"
                    onClick={() => console.log('Excluir produto:', product.id)}
                  >
                    🗑️ Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-brand-gray-light mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-brand-gray mb-4">
              Comece criando seu primeiro produto.
            </p>
            <Link
              href="/admin/produtos/novo"
              className="bg-brand-blue hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors inline-flex items-center"
            >
              ➕ Criar Primeiro Produto
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
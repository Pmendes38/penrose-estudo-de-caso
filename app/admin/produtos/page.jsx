'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminProdutos() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const mapProduct = (p) => ({
    id: p.id,
    name: p.name || p.title || 'Produto',
    category: p.category?.name || p.category || '-',
    price: typeof p.price === 'number' ? p.price : (Array.isArray(p.sizes) ? (p.sizes[0]?.price || 0) : 0),
    status: p.status || (p.active === true ? 'active' : p.active === false ? 'inactive' : 'active'),
    stock: typeof p.stock === 'number' ? p.stock : (p.inventory || 0),
    image: (Array.isArray(p.images) && p.images[0]) || p.mainImage || '/assets/products/venom/venom-1.jpg',
  });

  const fetchProducts = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('adminToken') || localStorage.getItem('authToken')
        : null;

      const res = await fetch('/api/products/admin', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.status === 401 || res.status === 403) {
        setError('Não autorizado. Faça login novamente.');
        setProducts([]);
        setIsLoading(false);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Erro ao buscar produtos');
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : (Array.isArray(data.products) ? data.products : []);
      setProducts(list.map(mapProduct));
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      setError(err.message || 'Erro ao carregar produtos');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleStatus = async (product) => {
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    const prev = products;
    // Otimista
    setProducts((curr) => curr.map((p) => (p.id === product.id ? { ...p, status: newStatus } : p)));
    try {
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('adminToken') || localStorage.getItem('authToken')
        : null;
      const res = await fetch(`/api/products/admin/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.status === 401 || res.status === 403) {
        setError('Não autorizado. Faça login novamente.');
        setProducts(prev);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Erro ao atualizar produto');
      }
    } catch (err) {
      console.error('Erro ao atualizar produto:', err);
      setError(err.message || 'Erro ao atualizar produto');
      setProducts(prev);
    }
  };

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
        <div className="flex items-center gap-3">
          <button
            onClick={fetchProducts}
            className="bg-brand-gray-dark hover:bg-brand-gray/60 text-brand-gray-light font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            ↻ Atualizar
          </button>
          <Link
            href="/admin/produtos/novo"
            className="bg-brand-blue hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center"
          >
            ➕ Novo Produto
          </Link>
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
                    className="text-yellow-300 hover:text-yellow-200 px-3 py-1 rounded transition-colors"
                    onClick={() => toggleStatus(product)}
                    title={product.status === 'active' ? 'Desativar' : 'Ativar'}
                  >
                    {product.status === 'active' ? '⏸️ Desativar' : '▶️ Ativar'}
                  </button>
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
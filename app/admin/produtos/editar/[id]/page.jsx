'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProductForm from '../../../../../components/Admin/ProductForm';

export default function EditarProdutoPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params || {};

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      setError('');
      try {
        const token = typeof window !== 'undefined'
          ? localStorage.getItem('adminToken') || localStorage.getItem('authToken')
          : null;

        const res = await fetch(`/api/products/admin/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (res.status === 401 || res.status === 403) {
          throw new Error('Não autorizado. Faça login novamente.');
        }
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || 'Erro ao buscar produto');
        }
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error('Erro ao carregar produto:', err);
        setError(err.message || 'Erro ao carregar produto');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleSave = async (payload) => {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('adminToken') || localStorage.getItem('authToken')
      : null;

    const res = await fetch(`/api/products/admin/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 401 || res.status === 403) {
      throw new Error('Não autorizado. Faça login novamente.');
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Erro ao atualizar produto');
    }

    router.push('/admin/produtos');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-700 rounded animate-pulse" />
        <div className="bg-brand-gray-dark rounded-lg border border-brand-gray-border p-6 space-y-4">
          <div className="h-6 bg-gray-700 rounded w-2/3 animate-pulse" />
          <div className="h-6 bg-gray-700 rounded w-1/2 animate-pulse" />
          <div className="h-6 bg-gray-700 rounded w-3/4 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-900/40 border border-red-600 text-red-200 px-4 py-3 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-brand-gray-light">Editar Produto</h2>
        <p className="mt-1 text-sm text-brand-gray">Atualize as informações do produto.</p>
      </div>
      <div className="bg-brand-gray-dark rounded-lg border border-brand-gray-border p-6">
        <ProductForm initialData={product || {}} onSave={handleSave} onCancel={() => router.push('/admin/produtos')} />
      </div>
    </div>
  );
}

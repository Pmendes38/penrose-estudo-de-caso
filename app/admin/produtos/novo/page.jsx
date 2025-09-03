'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ProductForm from '../../../../components/Admin/ProductForm';

export default function NovoProdutoPage() {
  const router = useRouter();

  const handleSave = async (payload) => {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('adminToken') || localStorage.getItem('authToken')
      : null;

    const res = await fetch('/api/products/admin', {
      method: 'POST',
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
      throw new Error(data.message || 'Erro ao criar produto');
    }

    // On success, go back to list
    router.push('/admin/produtos');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-brand-gray-light">Novo Produto</h2>
        <p className="mt-1 text-sm text-brand-gray">Cadastre um novo produto no catálogo.</p>
      </div>
      <div className="bg-brand-gray-dark rounded-lg border border-brand-gray-border p-6">
        <ProductForm onSave={handleSave} onCancel={() => router.push('/admin/produtos')} />
      </div>
    </div>
  );
}

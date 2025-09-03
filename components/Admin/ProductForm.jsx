'use client';

import React, { useMemo, useState } from 'react';

/**
 * Admin Product Form
 * Props:
 * - initialData: optional product object to prefill
 * - onSave: async function(payload) -> should resolve on success or throw Error
 * - onCancel: optional function
 */
export default function ProductForm({ initialData = {}, onSave, onCancel }) {
  const [name, setName] = useState(initialData.name || '');
  const [category, setCategory] = useState(
    typeof initialData.category === 'string' ? initialData.category : initialData.category?.name || ''
  );
  const [price, setPrice] = useState(
    typeof initialData.price === 'number' ? initialData.price : (Array.isArray(initialData.sizes) ? (initialData.sizes[0]?.price || 0) : 0)
  );
  const [stock, setStock] = useState(
    typeof initialData.stock === 'number' ? initialData.stock : (initialData.inventory || 0)
  );
  const [status, setStatus] = useState(initialData.status || (initialData.active === false ? 'inactive' : 'active'));
  const [description, setDescription] = useState(initialData.description || '');
  const [imagesText, setImagesText] = useState(
    (Array.isArray(initialData.images) ? initialData.images : (Array.isArray(initialData.moreImages) ? initialData.moreImages : [])).join(', ')
  );
  const [tagsText, setTagsText] = useState(
    Array.isArray(initialData.tags) ? initialData.tags.join(', ') : ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const payload = useMemo(() => {
    const imgArr = imagesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const tagsArr = tagsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return {
      name: name?.trim(),
      category: category?.trim(),
      price: Number(price) || 0,
      stock: Number.isFinite(Number(stock)) ? Number(stock) : 0,
      status: status === 'inactive' ? 'inactive' : 'active',
      description: description?.trim() || '',
      images: imgArr,
      tags: tagsArr,
    };
  }, [name, category, price, stock, status, description, imagesText, tagsText]);

  const isValid = useMemo(() => {
    return payload.name && payload.category && payload.price >= 0;
  }, [payload]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!onSave) return;
    setError('');
    setLoading(true);
    try {
      await onSave(payload);
    } catch (err) {
      console.error('Save product failed:', err);
      setError(err?.message || 'Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-900/40 border border-red-600 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-brand-gray mb-1">Nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-2 px-3 rounded focus:outline-none focus:border-brand-blue"
            placeholder="Nome do produto"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-brand-gray mb-1">Categoria</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-2 px-3 rounded focus:outline-none focus:border-brand-blue"
            placeholder="Ex: Marvel, Anime"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-brand-gray mb-1">Preço (R$)</label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-2 px-3 rounded focus:outline-none focus:border-brand-blue"
            placeholder="0,00"
          />
        </div>
        <div>
          <label className="block text-sm text-brand-gray mb-1">Estoque</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-2 px-3 rounded focus:outline-none focus:border-brand-blue"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm text-brand-gray mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-2 px-3 rounded focus:outline-none focus:border-brand-blue"
          >
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm text-brand-gray mb-1">Descrição</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-2 px-3 rounded focus:outline-none focus:border-brand-blue"
          placeholder="Detalhes do produto"
        />
      </div>

      <div>
        <label className="block text-sm text-brand-gray mb-1">Imagens (URLs, separadas por vírgula)</label>
        <input
          type="text"
          value={imagesText}
          onChange={(e) => setImagesText(e.target.value)}
          className="w-full bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-2 px-3 rounded focus:outline-none focus:border-brand-blue"
          placeholder="https://... , https://..."
        />
      </div>

      <div>
        <label className="block text-sm text-brand-gray mb-1">Tags (separadas por vírgula)</label>
        <input
          type="text"
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          className="w-full bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-2 px-3 rounded focus:outline-none focus:border-brand-blue"
          placeholder="marvel, filme"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!isValid || loading}
          className="bg-brand-blue hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          {loading ? 'Salvando...' : 'Salvar Produto'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-brand-gray-dark hover:bg-brand-gray/60 text-brand-gray-light font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

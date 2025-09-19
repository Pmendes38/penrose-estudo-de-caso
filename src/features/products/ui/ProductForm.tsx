'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';

type ServerAction = (formData: FormData) => Promise<any>;

type BasePayload = {
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive';
  description: string;
  images: string[];
  tags: string[];
};

type Props = {
  initialData?: Partial<{
    id: string;
    name: string;
    category: string | { name: string };
    price: number;
    stock: number;
    status: 'active' | 'inactive';
    description: string;
    images: string[];
    moreImages: string[];
    tags: string[];
    active: boolean;
    inventory: number;
    sizes?: Array<{ price?: number }>;
    mainImage?: string;
  }>;
  onCreateAction?: ServerAction;
  onUpdateAction?: ServerAction;
  onSave?: (payload: BasePayload) => Promise<any>;
  onCancelHref?: string;
  serverError?: string;
};

function SubmitButton({
  labelIdle = 'Salvar Produto',
  labelPending = 'Salvando…',
}: { labelIdle?: string; labelPending?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      aria-disabled={pending}
      disabled={pending}
      className="bg-brand-blue hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors"
    >
      {pending ? labelPending : labelIdle}
    </button>
  );
}

function csvToArray(value: FormDataEntryValue | null): string[] {
  return String(value ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function ProductForm({
  initialData = {},
  onCreateAction,
  onUpdateAction,
  onSave,
  onCancelHref,
  serverError,
}: Props) {
  const initial = useMemo(() => {
    const name = initialData.name ?? '';
    const category =
      typeof initialData.category === 'string'
        ? initialData.category
        : (initialData.category as any)?.name ?? '';
    const price =
      typeof initialData.price === 'number'
        ? initialData.price
        : Array.isArray(initialData.sizes)
        ? initialData.sizes[0]?.price ?? 0
        : 0;
    const stock =
      typeof initialData.stock === 'number'
        ? initialData.stock
        : (initialData.inventory as number) ?? 0;
    const status =
      initialData.status ?? (initialData.active === false ? 'inactive' : 'active');
    const description = initialData.description ?? '';
    const imagesArr = Array.isArray(initialData.images)
      ? initialData.images
      : Array.isArray(initialData.moreImages)
      ? initialData.moreImages
      : initialData.mainImage
      ? [initialData.mainImage]
      : [];
    const tagsArr = Array.isArray(initialData.tags) ? initialData.tags : [];

    return {
      id: initialData.id ?? '',
      name,
      category,
      price,
      stock,
      status: status === 'inactive' ? 'inactive' : 'active',
      description,
      imagesText: imagesArr.join(', '),
      tagsText: tagsArr.join(', '),
    };
  }, [initialData]);

  const [clientError, setClientError] = useState<string>('');
  const [loadingLegacy, setLoadingLegacy] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]); // pré-visualizações locais

  const hasServerAction = Boolean(onCreateAction || onUpdateAction);
  const action = onUpdateAction ?? onCreateAction;

  async function handleLegacySubmit(e: React.FormEvent<HTMLFormElement>) {
    if (hasServerAction || !onSave) return;
    e.preventDefault();
    setClientError('');
    setLoadingLegacy(true);

    const fd = new FormData(e.currentTarget);

    const payload: BasePayload = {
      name: String(fd.get('name') ?? '').trim(),
      category: String(fd.get('category') ?? '').trim(),
      price: Number(fd.get('price') ?? 0) || 0,
      stock: Number.isFinite(Number(fd.get('stock'))) ? Number(fd.get('stock')) : 0,
      status: (String(fd.get('status')) === 'inactive' ? 'inactive' : 'active') as
        | 'active'
        | 'inactive',
      description: String(fd.get('description') ?? '').trim(),
      images: csvToArray(fd.get('images')),
      tags: csvToArray(fd.get('tags')),
    };

    if (!payload.name || !payload.category || payload.price < 0) {
      setClientError('Preencha nome, categoria e preço válido.');
      setLoadingLegacy(false);
      return;
    }

    try {
      await onSave(payload);
    } catch (err: any) {
      setClientError(err?.message || 'Erro ao salvar produto');
    } finally {
      setLoadingLegacy(false);
    }
  }

  const formProps = hasServerAction
    ? { action }
    : { onSubmit: handleLegacySubmit as React.FormEventHandler<HTMLFormElement> };

  const disabledAll = loadingLegacy;

  return (
    <form
      {...formProps}
      className="space-y-6"
      aria-describedby={serverError || clientError ? 'form-error' : undefined}
      noValidate
      // IMPORTANTE: para enviar arquivos com Server Action
      encType="multipart/form-data"
    >
      {(serverError || clientError) && (
        <div
          id="form-error"
          className="bg-red-900/40 border border-red-600 text-red-200 px-4 py-3 rounded-lg"
          role="alert"
        >
          {serverError || clientError}
        </div>
      )}

      {initial.id && <input type="hidden" name="id" defaultValue={initial.id} />}

      <fieldset disabled={disabledAll} className="space-y-6">
        {/* Nome / Categoria */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm text-brand-gray mb-1">Nome</label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={initial.name}
              required
              placeholder="Nome do produto"
              autoComplete="off"
              className="w-full bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-2 px-3 rounded focus:outline-none focus:border-brand-blue"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm text-brand-gray mb-1">Categoria</label>
            <input
              id="category"
              name="category"
              type="text"
              defaultValue={initial.category}
              required
              placeholder="Ex: Marvel, Anime"
              autoComplete="off"
              className="w-full bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-2 px-3 rounded focus:outline-none focus:border-brand-blue"
            />
          </div>
        </div>

        {/* Preço / Estoque / Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm text-brand-gray mb-1">Preço (R$)</label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              inputMode="decimal"
              defaultValue={initial.price}
              placeholder="0,00"
              min={0}
              className="w-full bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-2 px-3 rounded focus:outline-none focus:border-brand-blue"
            />
          </div>
          <div>
            <label htmlFor="stock" className="block text-sm text-brand-gray mb-1">Estoque</label>
            <input
              id="stock"
              name="stock"
              type="number"
              inputMode="numeric"
              defaultValue={initial.stock}
              placeholder="0"
              min={0}
              className="w-full bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-2 px-3 rounded focus:outline-none focus:border-brand-blue"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm text-brand-gray mb-1">Status</label>
            <select
              id="status"
              name="status"
              defaultValue={initial.status}
              className="w-full bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-2 px-3 rounded focus:outline-none focus:border-brand-blue"
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
        </div>

        {/* Descrição */}
        <div>
          <label htmlFor="description" className="block text-sm text-brand-gray mb-1">Descrição</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={initial.description}
            placeholder="Detalhes do produto"
            className="w-full bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-2 px-3 rounded focus:outline-none focus:border-brand-blue"
          />
        </div>

        {/* Upload de imagens */}
        <div className="space-y-2">
          <label htmlFor="files" className="block text-sm text-brand-gray mb-1">
            Imagens (upload)
          </label>
          <input
            id="files"
            name="files"
            type="file"
            multiple
            accept="image/*"
            className="block w-full text-sm text-brand-gray-light
                       file:mr-4 file:py-2 file:px-4
                       file:rounded file:border-0
                       file:text-sm file:font-semibold
                       file:bg-brand-gray file:text-brand-gray-light
                       hover:file:bg-brand-gray/70"
            onChange={(e) => {
              const files = Array.from(e.currentTarget.files ?? []);
              const next = files.map((f) => URL.createObjectURL(f));
              setPreviews(next);
            }}
          />
          {previews.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-2">
              {previews.map((src, i) => (
                <div key={i} className="aspect-square overflow-hidden rounded border border-brand-gray-border">
                  <img
                    src={src}
                    alt={`preview-${i}`}
                    className="w-full h-full object-cover"
                    onLoad={() => URL.revokeObjectURL(src)}
                  />
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-brand-gray">
            Você ainda pode informar URLs manualmente no campo abaixo (opcional).
          </p>
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm text-brand-gray mb-1">Tags (separadas por vírgula)</label>
          <input
            id="tags"
            name="tags"
            type="text"
            defaultValue={initial.tagsText}
            placeholder="marvel, filme"
            className="w-full bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-2 px-3 rounded focus:outline-none focus:border-brand-blue"
          />
        </div>
      </fieldset>

      <div className="flex items-center gap-3">
        {hasServerAction ? (
          <SubmitButton />
        ) : (
          <button
            type="submit"
            disabled={loadingLegacy}
            className="bg-brand-blue hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            {loadingLegacy ? 'Salvando…' : 'Salvar Produto'}
          </button>
        )}

        {onCancelHref && (
          <Link
            href={onCancelHref}
            className="bg-brand-gray-dark hover:bg-brand-gray/60 text-brand-gray-light font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Cancelar
          </Link>
        )}
      </div>
    </form>
  );
}

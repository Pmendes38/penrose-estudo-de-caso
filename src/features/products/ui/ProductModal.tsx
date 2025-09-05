// src/components/ProductModal/ProductModal.tsx
'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { formatBRL } from '@/src/shared/lib/format';
import { useCart } from '@/src/shared/context/CartContext';
import OptimizedImage from '@/src/shared/ui/optimized-image/index';

type Size = { label: string; price: number };
type Product = {
  id: string;
  name: string;
  price?: number;
  description?: string;
  images: string[];
  tags?: string[] | string;
  sizes?: Size[];
};

type Props = {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
};

export default function ProductModal({ product, isOpen, onClose }: Props) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addItem } = useCart();
  const dialogRef = useRef<HTMLDivElement>(null);

  // Reset ao abrir
  useEffect(() => {
    if (isOpen && product) {
      setSelectedSize('');
      setQuantity(1);
      setCurrentImageIndex(0);
    }
  }, [isOpen, product]);

  // ESC + scroll lock + foco
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // foco inicial
    dialogRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  const images = useMemo(() => product?.images?.filter(Boolean) ?? [], [product]);
  const tags = useMemo(() => {
    if (!product?.tags) return [];
    return Array.isArray(product.tags)
      ? product.tags
      : product.tags.split(/[,\s]+/).filter(Boolean);
  }, [product]);

  const currentPrice = useMemo(() => {
    if (!product) return 0;
    if (product.sizes?.length && selectedSize) {
      const size = product.sizes.find(s => s.label === selectedSize);
      return size?.price ?? product.price ?? 0;
    }
    return product.price ?? 0;
  }, [product, selectedSize]);

  const canSubmit = useMemo(() => {
    if (!product) return false;
    if (product.sizes?.length) return Boolean(selectedSize);
    return true;
  }, [product, selectedSize]);

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleAddToCart = useCallback(() => {
    if (!product || !canSubmit) return;

    const itemToAdd = {
      id: product.sizes?.length ? `${product.id}-${selectedSize}` : product.id,
      name: product.name,
      price: currentPrice,
      image: images[currentImageIndex] ?? images[0],
      size: selectedSize || 'Único',
      quantity,
    };

    addItem(itemToAdd);
    onClose();
  }, [product, canSubmit, selectedSize, currentPrice, images, currentImageIndex, quantity, addItem, onClose]);

  if (!isOpen || !product) return null;

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 p-4 flex items-center justify-center"
      onMouseDown={handleBackdrop}
      aria-hidden={!isOpen}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto outline-none"
        ref={dialogRef}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 id="product-modal-title" className="text-2xl font-bold text-gray-900">
            {product.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
            aria-label="Fechar"
          >
            &times;
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Galeria */}
          <div className="space-y-4">
            <div className="relative w-full h-96 overflow-hidden rounded-xl bg-gray-100">
              <OptimizedImage
                src={images[currentImageIndex] ?? images[0]}
                alt={product.name}
                fill
                objectFit="cover"
                objectPosition="center"
                showLoader
              />
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((image, idx) => (
                  <button
                    key={image + idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      idx === currentImageIndex ? 'border-indigo-500' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    aria-label={`Selecionar imagem ${idx + 1}`}
                  >
                    {/* thumbnails podem ser img padrão para leveza */}
                    <img src={image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <p className="text-3xl font-bold text-indigo-600">{formatBRL(currentPrice)}</p>
              {product.sizes && product.sizes.length > 1 && (
                <p className="text-sm text-gray-500 mt-1">Preço varia conforme o tamanho</p>
              )}
            </div>

            {product.description && (
              <section aria-labelledby="product-desc-title">
                <h4 id="product-desc-title" className="text-lg font-semibold text-gray-900 mb-2">
                  Descrição
                </h4>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </section>
            )}

            {!!tags.length && (
              <section aria-labelledby="product-tags-title">
                <h4 id="product-tags-title" className="text-lg font-semibold text-gray-900 mb-2">
                  Características
                </h4>
                <div className="flex flex-wrap gap-2">
                  {tags.slice(0, 8).map((tag, i) => (
                    <span key={tag + i} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {product.sizes?.length ? (
              <section aria-labelledby="product-size-title">
                <h4 id="product-size-title" className="text-lg font-semibold text-gray-900 mb-3">
                  Tamanho
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {product.sizes.map(size => (
                    <button
                      key={size.label}
                      onClick={() => setSelectedSize(size.label)}
                      className={`py-3 px-4 border rounded-lg font-medium transition-colors ${
                        selectedSize === size.label
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50'
                      }`}
                      aria-pressed={selectedSize === size.label}
                    >
                      <div className="text-center">
                        <div className="font-semibold">{size.label}</div>
                        <div className="text-sm text-gray-600">{formatBRL(size.price)}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            {/* Quantidade */}
            <section aria-labelledby="qty-title">
              <h4 id="qty-title" className="text-lg font-semibold text-gray-900 mb-3">
                Quantidade
              </h4>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50"
                  aria-label="Diminuir quantidade"
                >
                  −
                </button>
                <span className="w-16 text-center text-lg font-medium" aria-live="polite">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50"
                  aria-label="Aumentar quantidade"
                >
                  +
                </button>
              </div>
            </section>

            <button
              onClick={handleAddToCart}
              disabled={!canSubmit}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors ${
                !canSubmit ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {!canSubmit
                ? 'Selecione um tamanho'
                : `Adicionar ao Carrinho • ${formatBRL(currentPrice * quantity)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import OptimizedImage from '../Image/OptimizedImage';
import Button from '../Button/Button';

export default function ProductCard({ product }) {
  const [selectedSize, setSelectedSize] = useState('');
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    if (!selectedSize) {
      setShowSizeSelector(true);
      return;
    }

    const sizeData = product.sizes.find(size => (size.label || size.name) === selectedSize);
    if (sizeData) {
      addItem({
        id: `${product.id}-${selectedSize}`,
        name: product.name,
        price: sizeData.price,
        image: product.images?.[0] || product.mainImage,
        size: selectedSize,
        quantity: 1
      });
      
      // Reset size selection
      setSelectedSize('');
      setShowSizeSelector(false);
    }
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    setShowSizeSelector(false);
  };

  const formatPrice = (price) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  const getLowestPrice = () => {
    if (!product.sizes || product.sizes.length === 0) return 0;
    const prices = product.sizes.map(size => size.price);
    return Math.min(...prices);
  };

  const getHighestPrice = () => {
    if (!product.sizes || product.sizes.length === 0) return 0;
    const prices = product.sizes.map(size => size.price);
    return Math.max(...prices);
  };

  const hasMultiplePrices = () => {
    return product.sizes && product.sizes.length > 1 && getLowestPrice() !== getHighestPrice();
  };

  return (
    <article className="bg-brand-gray-dark rounded-2xl shadow-soft overflow-hidden hover:shadow-hard transition-all duration-400 hover:-translate-y-2 group border border-brand-gray-border/50 hover:border-brand-blue/30 animate-fade-in">
      {/* Imagem do produto */}
      <Link href={`/produto/${product.id}`} className="block relative">
        <div className="relative group-inner cursor-pointer overflow-hidden">
          <OptimizedImage
            src={product.images?.[0] || '/assets/placeholder-product.jpg'}
            alt={`Action Figure ${product.name} - Clique para ver detalhes`}
            width={400}
            height={300}
            className="w-full h-64 object-cover object-top group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
            objectPosition="top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
          
          {/* Quick view overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-400">
            <div className="bg-brand-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
              Ver Detalhes
            </div>
          </div>
        </div>
      </Link>

      {/* Informações do produto */}
      <div className="p-6">
        <Link href={`/produto/${product.id}`} className="block mb-4">
          <h3 className="text-lg font-semibold text-brand-gray-light mb-2 hover:text-brand-blue transition-colors cursor-pointer line-clamp-2 group-hover:text-brand-blue-light">
            {product.name}
          </h3>
        </Link>

    {/* Tags */}
    {Array.isArray(product.tags) && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4" role="list" aria-label="Categorias do produto">
            {product.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                role="listitem"
                className="px-3 py-1 bg-brand-gray-border/30 text-brand-gray text-xs rounded-full border border-brand-gray-border hover:border-brand-blue/50 transition-colors"
              >
                {tag}
              </span>
            ))}
      {product.tags.length > 3 && (
              <span className="px-3 py-1 bg-brand-gray-border/20 text-brand-gray text-xs rounded-full">
                +{product.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Preço */}
        <div className="mb-6">
          {hasMultiplePrices() ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-brand-blue" aria-label={`Preço a partir de ${formatPrice(getLowestPrice())}`}>
                  {formatPrice(getLowestPrice())}
                </span>
                <span className="text-sm text-brand-gray">
                  até {formatPrice(getHighestPrice())}
                </span>
              </div>
              <span className="text-xs text-brand-gray">Varia por tamanho</span>
            </div>
          ) : (
            <span className="text-2xl font-bold text-brand-blue" aria-label={`Preço ${formatPrice(getLowestPrice())}`}>
              {formatPrice(getLowestPrice())}
            </span>
          )}
        </div>

        {/* Seletor de tamanho */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mb-6">
            <fieldset>
              <legend className="text-sm font-medium text-brand-gray-light mb-3">
                Tamanhos disponíveis:
                {selectedSize && (
                  <span className="text-brand-blue font-semibold ml-2">
                    {selectedSize}
                  </span>
                )}
              </legend>
              
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Selecionar tamanho">
                {product.sizes.map((size) => {
                  const sizeLabel = size.label || size.name;
                  return (
                    <button
                      key={sizeLabel}
                      onClick={() => handleSizeSelect(sizeLabel)}
                      className={`px-4 py-2.5 text-sm border rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 focus:ring-offset-brand-gray-dark ${
                        selectedSize === sizeLabel
                          ? 'border-brand-blue bg-brand-blue/20 text-brand-blue shadow-glow'
                          : 'border-brand-gray-border text-brand-gray hover:border-brand-blue/50 hover:bg-brand-gray-border/20'
                      }`}
                      role="radio"
                      aria-checked={selectedSize === sizeLabel}
                      aria-label={`Tamanho ${sizeLabel} - ${formatPrice(size.price)}`}
                    >
                      <div className="text-center">
                        <div className="font-medium">{sizeLabel}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>
        )}

        {/* Ações */}
        <div className="space-y-3">
          <Button
            onClick={handleAddToCart}
            disabled={product.sizes && product.sizes.length > 0 && !selectedSize}
            variant="primary"
            size="md"
            fullWidth
            aria-label={
              product.sizes && product.sizes.length > 0 && !selectedSize
                ? 'Selecione um tamanho primeiro'
                : `Adicionar ${product.name} ao carrinho`
            }
          >
            {product.sizes && product.sizes.length > 0 && !selectedSize
              ? 'Selecione um tamanho'
              : 'Adicionar ao Carrinho'
            }
          </Button>

          <Link href={`/produto/${product.id}`} className="block">
            <Button variant="outline" size="md" fullWidth>
              Ver Detalhes
            </Button>
          </Link>
        </div>
      </div>

      {/* Badges */}
      <div className="absolute top-3 left-3 flex flex-col gap-2">
        {product.isNew && (
          <span className="px-3 py-1.5 bg-gradient-to-r from-brand-success to-green-600 text-white text-xs font-semibold rounded-full shadow-medium backdrop-blur-sm animate-scale-in">
            ✨ Novo
          </span>
        )}
        {product.prontaEntrega && (
          <span className="px-3 py-1.5 bg-gradient-to-r from-brand-warning to-yellow-600 text-white text-xs font-semibold rounded-full shadow-medium backdrop-blur-sm">
            🚀 Pronta Entrega
          </span>
        )}
      </div>

      <div className="absolute top-3 right-3 flex flex-col gap-2">
        {product.discount && (
          <span className="px-3 py-1.5 bg-gradient-to-r from-brand-error to-red-600 text-white text-xs font-semibold rounded-full shadow-medium backdrop-blur-sm animate-pulse-slow">
            -{product.discount}% OFF
          </span>
        )}
      </div>
    </article>
  );
}
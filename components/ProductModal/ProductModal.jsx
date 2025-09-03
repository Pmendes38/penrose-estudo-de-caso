'use client';

import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';

export default function ProductModal({ product, isOpen, onClose }) {
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addItem } = useCart();

  useEffect(() => {
    if (isOpen && product) {
      // Reset state when modal opens
      setSelectedSize('');
      setQuantity(1);
      setCurrentImageIndex(0);
    }
  }, [isOpen, product]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleAddToCart = () => {
    if (!product) return;

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert('Por favor, selecione um tamanho');
      return;
    }

    const itemToAdd = {
      id: product.sizes && product.sizes.length > 0 
        ? `${product.id}-${selectedSize}` 
        : product.id,
      name: product.name,
      price: product.sizes && product.sizes.length > 0 
        ? product.sizes.find(s => s.label === selectedSize)?.price || product.price
        : product.price,
      image: product.images[currentImageIndex] || product.images[0],
      size: selectedSize || 'Único',
      quantity: quantity
    };

    addItem(itemToAdd);
    onClose();
  };

  const handleImageChange = (index) => {
    setCurrentImageIndex(index);
  };

  const formatPrice = (price) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  const getCurrentPrice = () => {
    if (product.sizes && product.sizes.length > 0 && selectedSize) {
      const sizeData = product.sizes.find(s => s.label === selectedSize);
      return sizeData ? sizeData.price : 0;
    }
    return product.price || 0;
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl font-light"
          >
            &times;
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Galeria de imagens */}
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={product.images[currentImageIndex] || product.images[0]}
                  alt={product.name}
                  className="w-full h-96 object-cover rounded-lg"
                />
              </div>
              
              {product.images && product.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => handleImageChange(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex
                          ? 'border-indigo-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} - Imagem ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Informações do produto */}
            <div className="space-y-6">
              {/* Preço */}
              <div>
                <h3 className="text-3xl font-bold text-indigo-600">
                  {formatPrice(getCurrentPrice())}
                </h3>
                {product.sizes && product.sizes.length > 1 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Preço varia conforme o tamanho
                  </p>
                )}
              </div>

              {/* Descrição */}
              {product.description && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Descrição</h4>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Características</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Seletor de tamanho */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Tamanho</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {product.sizes.map((size) => (
                      <button
                        key={size.label}
                        onClick={() => setSelectedSize(size.label)}
                        className={`py-3 px-4 border rounded-lg font-medium transition-colors ${
                          selectedSize === size.label
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="text-center">
                          <div className="font-semibold">{size.label}</div>
                          <div className="text-sm text-gray-600">
                            {formatPrice(size.price)}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Seletor de quantidade */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Quantidade</h4>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="w-16 text-center text-lg font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Botão de adicionar ao carrinho */}
              <button
                onClick={handleAddToCart}
                disabled={product.sizes && product.sizes.length > 0 && !selectedSize}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors ${
                  product.sizes && product.sizes.length > 0 && !selectedSize
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {product.sizes && product.sizes.length > 0 && !selectedSize
                  ? 'Selecione um tamanho'
                  : `Adicionar ao Carrinho - ${formatPrice(getCurrentPrice() * quantity)}`
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
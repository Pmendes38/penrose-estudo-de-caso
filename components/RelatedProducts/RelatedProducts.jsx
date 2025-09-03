'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function RelatedProducts({ currentProduct, allProducts, onProductClick }) {
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    if (currentProduct && allProducts) {
      // Filtra produtos relacionados baseado em tags similares
      const related = allProducts
        .filter(product => {
          const productTags = Array.isArray(product.tags) ? product.tags : (typeof product.tags === 'string' ? product.tags.split(/[,\s]+/).filter(Boolean) : []);
          const currentTags = Array.isArray(currentProduct.tags) ? currentProduct.tags : (typeof currentProduct.tags === 'string' ? currentProduct.tags.split(/[,\s]+/).filter(Boolean) : []);
          return (
            product.id !== currentProduct.id &&
            productTags.length > 0 &&
            currentTags.length > 0 &&
            productTags.some(tag => currentTags.includes(tag))
          );
        })
        .slice(0, 4); // Limita a 4 produtos

      // Se não encontrar produtos relacionados por tags, pega produtos da mesma categoria
      if (related.length === 0) {
        const sameCategory = allProducts
          .filter(product => 
            product.id !== currentProduct.id && 
            product.category === currentProduct.category
          )
          .slice(0, 4);
        setRelatedProducts(sameCategory);
      } else {
        setRelatedProducts(related);
      }
    }
  }, [currentProduct, allProducts]);

  if (relatedProducts.length === 0) {
    return null;
  }

  const formatPrice = (price) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  const getLowestPrice = (product) => {
    if (!product.sizes || product.sizes.length === 0) return product.price || 0;
    const prices = product.sizes.map(size => size.price);
    return Math.min(...prices);
  };

  return (
    <div className="border-t border-gray-700 pt-6 mt-6">
      <h3 className="text-2xl font-bold text-white mb-6">Produtos Relacionados</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <div
            key={product.id}
            className="bg-gray-800/50 rounded-lg overflow-hidden hover:bg-gray-800/70 transition-colors cursor-pointer group"
            onClick={() => onProductClick(product)}
          >
            {/* Imagem do produto */}
            <div className="relative overflow-hidden">
              <img
                src={product.images ? product.images[0] : product.mainImage}
                alt={product.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = "https://placehold.co/400x400/374151/9CA3AF?text=Imagem+Indisponível";
                }}
              />
              
              {/* Indicadores de status */}
              {product.isNew && (
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                    Novo
                  </span>
                </div>
              )}
              
              {product.discount && (
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                    -{product.discount}%
                  </span>
                </div>
              )}
            </div>

            {/* Informações do produto */}
            <div className="p-4">
              {/* Categoria */}
              {product.category && (
                <span className="text-sm font-semibold text-orange-400 block mb-1">
                  {product.category}
                </span>
              )}

              {/* Nome do produto */}
              <h4 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-orange-400 transition-colors">
                {product.name}
              </h4>

              {/* Preço */}
              <div className="mb-3">
                {product.sizes && product.sizes.length > 0 ? (
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white">
                      {formatPrice(getLowestPrice(product))}
                    </span>
                    {product.sizes.length > 1 && (
                      <span className="text-sm text-gray-400">
                        a partir de
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-lg font-bold text-white">
                    {formatPrice(product.price || 0)}
                  </span>
                )}
              </div>

              {/* Tags */}
              {Array.isArray(product.tags) && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {product.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Botão de ação */}
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onProductClick(product);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-md transition-colors text-sm"
                >
                  Ver Detalhes
                </button>
                
                <Link
                  href={`/produto/${product.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-3 rounded-md transition-colors text-sm"
                >
                  Abrir
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botão para ver mais produtos */}
      <div className="text-center mt-8">
        <Link
          href="/produtos"
          className="inline-flex items-center px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
        >
          Ver Todos os Produtos
          <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
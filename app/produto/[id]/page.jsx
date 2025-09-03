'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../../../context/CartContext.jsx';
import RelatedProducts from '../../../components/RelatedProducts/RelatedProducts.jsx';
import ShippingCalculator from '../../../components/ShippingCalculator/ShippingCalculator.jsx';

// (Removido) Supabase client direto no frontend não é necessário para esta página

// Componente de Galeria de Imagens Profissional
const ImageGallery = ({ images, mainImage, onImageChange, productName }) => {
    const validImages = images?.filter(img => img && img.trim() !== '') || [];
    
    return (
        <div className="space-y-4">
            {/* Imagem Principal com Zoom */}
            <div className="relative group overflow-hidden rounded-xl bg-gray-900">
                <img 
                    src={mainImage} 
                    alt={productName}
                    className="w-full aspect-square object-cover object-center transition-transform duration-300 group-hover:scale-105"
                />
                {/* Overlay de Zoom */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium">
                        🔍 Clique para ampliar
                    </span>
                </div>
            </div>
            
            {/* Thumbnails com Scroll Horizontal */}
            {validImages.length > 1 ? (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {validImages.map((imgSrc, index) => (
                        <button
                            key={index}
                            onClick={() => onImageChange(imgSrc)}
                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                                mainImage === imgSrc 
                                    ? 'border-brand-blue ring-2 ring-brand-blue/50' 
                                    : 'border-gray-600 hover:border-gray-400'
                            }`}
                        >
                            <img 
                                src={imgSrc} 
                                alt={`${productName} - Imagem ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-400 text-sm py-4">
                    📷 Galeria de imagens não disponível
                </div>
            )}
        </div>
    );
};

// Componente de Seleção de Tamanho Otimizado
const SizeSelector = ({ sizes, selectedSize, onSizeSelect, productName, showSizeGuide, setShowSizeGuide }) => (
    <div className="space-y-3">
        <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Tamanho</h3>
            <button 
                onClick={() => setShowSizeGuide(!showSizeGuide)}
                className="text-sm text-brand-blue hover:underline transition-colors flex items-center gap-2"
            >
                📏 Guia de tamanhos
                <img
                    src="https://example.supabase.co/storage/v1/object/public/produtos/Tamanhos/GUIADETAMANHOS.jpg"
                    alt="Guia de Tamanhos"
                    className="w-6 h-6 rounded object-cover"
                />
            </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
            {sizes.map((size) => (
                <button
                    key={size.name}
                    onClick={() => onSizeSelect(size)}
                    disabled={!size.inStock}
                    className={`relative p-3 rounded-lg border-2 transition-all ${
                        selectedSize?.name === size.name
                            ? 'border-brand-blue bg-brand-blue text-white shadow-lg'
                            : size.inStock
                                ? 'border-gray-600 text-gray-300 hover:border-brand-blue/50 hover:bg-gray-800'
                                : 'border-gray-700 bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    <span className="font-medium">{size.name}</span>
                    {!size.inStock && (
                        <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white px-1 rounded-full">
                            ESG
                        </span>
                    )}
                </button>
            ))}
        </div>
        
        {/* Guia de Tamanhos Expandível */}
        {showSizeGuide && (
            <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="text-lg font-semibold text-white">📏 Guia de Tamanhos</h4>
                    <button
                        onClick={() => setShowSizeGuide(false)}
                        className="text-gray-400 hover:text-white text-xl font-light"
                    >
                        ×
                    </button>
                </div>
                <img
                    src="https://example.supabase.co/storage/v1/object/public/produtos/Tamanhos/GUIADETAMANHOS.jpg"
                    alt="Guia de Tamanhos"
                    className="w-full h-auto rounded-lg shadow-lg"
                />
                <p className="text-sm text-gray-400 mt-3 text-center">
                    Todas as peças são fabricadas por nós em Resina Premium de alta qualidade
                </p>
            </div>
        )}
    </div>
);

// Componente de Informações do Produto
const ProductInfo = ({ product, selectedSize, onAddToCart, onBuyNow, onSizeSelect, showSizeGuide, setShowSizeGuide }) => (
    <div className="space-y-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/#catalogo" className="hover:text-white transition-colors">Catálogo</Link>
            <span className="mx-2">/</span>
            <span className="text-white">{product.name}</span>
        </nav>

        {/* Título e Categoria */}
        <div>
            <span className="inline-block px-3 py-1 bg-brand-blue/20 text-brand-blue text-sm font-medium rounded-full mb-3">
                {product.category || 'Colecionável'}
            </span>
            <h1 className="text-4xl font-bold text-white leading-tight">{product.name}</h1>
        </div>

        {/* Preço e Desconto */}
        <div className="space-y-2">
            {selectedSize ? (
                <>
                    <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold text-white">
                            R$ {selectedSize.price?.toFixed(2).replace('.', ',')}
                        </span>
                        {selectedSize.originalPrice && selectedSize.originalPrice > selectedSize.price && (
                            <>
                                <span className="text-xl text-gray-400 line-through">
                                    R$ {selectedSize.originalPrice?.toFixed(2).replace('.', ',')}
                                </span>
                                <span className="px-2 py-1 bg-red-500 text-white text-sm font-bold rounded">
                                    -{Math.round(((selectedSize.originalPrice - selectedSize.price) / selectedSize.originalPrice) * 100)}%
                                </span>
                            </>
                        )}
                    </div>
                    <p className="text-sm text-gray-400">
                        Parcelamos em até 4x sem juros, mas podemos parcelar em até 12x
                    </p>
                </>
            ) : (
                <p className="text-lg text-gray-400">Selecione um tamanho para ver o preço</p>
            )}
        </div>

        {/* Descrição */}
        <div>
            <h3 className="text-lg font-semibold text-white mb-2">Descrição</h3>
            <p className="text-gray-300 leading-relaxed">{product.description}</p>
        </div>

        {/* Seleção de Tamanho */}
        {product.sizes && product.sizes.length > 0 && (
            <SizeSelector 
                sizes={product.sizes}
                selectedSize={selectedSize}
                onSizeSelect={onSizeSelect}
                productName={product.name}
                showSizeGuide={showSizeGuide}
                setShowSizeGuide={setShowSizeGuide}
            />
        )}

        {/* Cálculo de Frete */}
        <ShippingCalculator product={product} selectedSize={selectedSize} />

        {/* Botões de Ação */}
        <div className="space-y-3">
            <button
                onClick={onAddToCart}
                disabled={!selectedSize}
                className="w-full bg-brand-blue hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
                {selectedSize ? '🛒 Adicionar ao Carrinho' : 'Selecione um tamanho'}
            </button>
            
            <button
                onClick={onBuyNow}
                disabled={!selectedSize}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
                {selectedSize ? '⚡ Comprar Agora' : 'Selecione um tamanho'}
            </button>
        </div>

        {/* Garantias e Segurança */}
        <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-700">
            <div className="text-center">
                <div className="text-2xl mb-2">🛡️</div>
                <p className="text-sm text-gray-400">Compra Segura</p>
            </div>
            <div className="text-center">
                <div className="text-2xl mb-2">🚚</div>
                <p className="text-sm text-gray-400">Entrega Rápida</p>
            </div>
            <div className="text-center">
                <div className="text-2xl mb-2">↩️</div>
                <p className="text-sm text-gray-400">7 dias para troca</p>
            </div>
            <div className="text-center">
                <div className="text-2xl mb-2">💳</div>
                <p className="text-sm text-gray-400">Parcelamos em até 4x sem juros, mas podemos parcelar em até 12x</p>
            </div>
        </div>
    </div>
);

// Componente de Especificações Técnicas
const ProductSpecs = ({ product }) => (
    <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Especificações Técnicas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
                <div className="flex justify-between">
                    <span className="text-gray-400">Material:</span>
                    <span className="text-white">{product.material || 'Não especificado'}</span>
                </div>
            </div>
            <div className="space-y-3">
                <div className="flex justify-between">
                    <span className="text-gray-400">Categoria:</span>
                    <span className="text-white">{product.category || 'Não especificado'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400">SKU: <span className="text-xs text-gray-500">(Código único do produto)</span></span>
                    <span className="text-white">{product.sku || product.id || 'Não especificado'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400">Origem: <span className="text-xs text-gray-500">(País de fabricação)</span></span>
                    <span className="text-white">{product.origin || 'Não especificado'}</span>
                </div>
            </div>
        </div>
    </div>
);

// Componente de Loading Otimizado
const LoadingSkeleton = () => (
    <div className="min-h-screen bg-brand-black">
        <div className="container mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-2 gap-12">
                {/* Skeleton da imagem */}
                <div className="space-y-4">
                    <div className="w-full aspect-square bg-gray-800 rounded-xl animate-pulse"></div>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="w-20 h-20 bg-gray-800 rounded-lg animate-pulse"></div>
                        ))}
                    </div>
                </div>
                
                {/* Skeleton das informações */}
                <div className="space-y-6">
                    <div className="h-4 bg-gray-800 rounded animate-pulse w-1/3"></div>
                    <div className="h-8 bg-gray-800 rounded animate-pulse w-2/3"></div>
                    <div className="h-6 bg-gray-800 rounded animate-pulse w-1/2"></div>
                    <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-4 bg-gray-800 rounded animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// Componente de Produto Não Encontrado
const NotFound = () => (
    <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <div className="text-center">
            <div className="text-6xl mb-4">😕</div>
            <h1 className="text-4xl font-bold text-white mb-4">Produto não encontrado</h1>
            <p className="text-gray-400 mb-8">O produto que você está procurando não existe ou foi removido.</p>
            <Link 
                href="/" 
                className="inline-block bg-brand-blue hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
                Voltar para a loja
            </Link>
        </div>
    </div>
);

// Página Principal
export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const productId = params.id;
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [allProducts, setAllProducts] = useState([]);
    const [selectedSize, setSelectedSize] = useState(null);
    const [mainImage, setMainImage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showSizeGuide, setShowSizeGuide] = useState(false);

    useEffect(() => {
        if (!productId) return;

        const fetchProductData = async () => {
            setIsLoading(true);
            try {
                console.log('🔄 Buscando produto:', productId);

                // Usar a nova API de produtos para buscar com todos os tamanhos
                const productResponse = await fetch('/api/products', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id: productId }),
                });

                if (productResponse.ok) {
                    const productResult = await productResponse.json();
                    
                    if (productResult.success && productResult.product) {
                        console.log('✅ Produto carregado com sucesso:', productResult.product.name);
                        console.log('📏 Tamanhos disponíveis:', productResult.product.sizes?.length || 0);
                        
                        const productData = productResult.product;
                        
                        setProduct(productData);
                        setMainImage(productData.mainImage);
                        
                        // Selecionar o primeiro tamanho disponível
                        if (productData.sizes && productData.sizes.length > 0) {
                            const firstAvailableSize = productData.sizes.find(size => size.inStock) || productData.sizes[0];
                            setSelectedSize(firstAvailableSize);
                            console.log('✅ Tamanho selecionado:', firstAvailableSize.name, '- R$', firstAvailableSize.price);
                        }

                        // Buscar todos os produtos para relacionados
                        const allProductsResponse = await fetch('/api/products');
                        if (allProductsResponse.ok) {
                            const allProductsResult = await allProductsResponse.json();
                            if (allProductsResult.success) {
                                setAllProducts(allProductsResult.products.filter(p => p.id !== productId));
                            } else {
                                setAllProducts([]);
                            }
                        } else {
                            setAllProducts([]);
                        }
                    } else {
                        console.error('❌ Produto não encontrado:', productResult.error);
                        setProduct(null);
                    }
                } else {
                    console.error('❌ Erro na requisição:', productResponse.status);
                    setProduct(null);
                }

            } catch (error) {
                console.error("❌ Erro ao buscar dados do produto:", error);
                setProduct(null);
            } finally {
                setIsLoading(false);
                if (typeof window !== 'undefined') {
                    window.scrollTo(0, 0);
                }
            }
        };

        fetchProductData();
    }, [productId]);

    if (isLoading) {
        return <LoadingSkeleton />;
    }

    if (!product) {
        return <NotFound />;
    }

    const handleAddToCart = () => {
        if (!selectedSize) return;
        const productToAdd = {
            ...product,
            selectedSize: selectedSize.name,
            price: selectedSize.price,
            quantity: 1
        };
        addToCart(productToAdd);
        
        console.log('✅ Produto adicionado ao carrinho!');
    };

    const handleBuyNow = () => {
        if (!selectedSize) return;
        handleAddToCart();
        router.push('/carrinho');
    };

    return (
        <div className="min-h-screen bg-brand-black">
            <div className="container mx-auto px-4 py-8">
                {/* Layout Principal */}
                <div className="grid lg:grid-cols-2 gap-12 mb-16">
                    <ImageGallery 
                        images={(() => {
                            const allImages = [product.mainImage];
                            if (product.moreImages && Array.isArray(product.moreImages)) {
                                product.moreImages.forEach(img => {
                                    if (img && img !== product.mainImage && !allImages.includes(img)) {
                                        allImages.push(img);
                                    }
                                });
                            }
                            return allImages;
                        })()}
                        mainImage={mainImage}
                        onImageChange={setMainImage}
                        productName={product.name}
                    />
                    
                    <ProductInfo 
                        product={product}
                        selectedSize={selectedSize}
                        onAddToCart={handleAddToCart}
                        onBuyNow={handleBuyNow}
                        onSizeSelect={setSelectedSize}
                        showSizeGuide={showSizeGuide}
                        setShowSizeGuide={setShowSizeGuide}
                    />
                </div>

                {/* Especificações */}
                <ProductSpecs product={product} />

                {/* Produtos Relacionados */}
                {allProducts.length > 1 && (
                    <div className="mt-16">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">
                            Você também pode gostar
                        </h2>
                        <RelatedProducts
                            currentProduct={product}
                            allProducts={allProducts}
                            onProductClick={(p) => router.push(`/produto/${p.id}`)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
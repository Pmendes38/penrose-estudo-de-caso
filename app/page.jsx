'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import ProductCard from "../components/ProductCard/ProductCard.jsx";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext.jsx';
import { LoadingSpinner, SkeletonCard } from '../components/Loading/Loading.jsx';
import OptimizedImage from '../components/Image/OptimizedImage.jsx';

const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < breakpoint);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [breakpoint]);
  return isMobile;
};

const ScrollIndicator = () => (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
        <a href="#sobre" aria-label="Rolar para a próxima seção">
            <div className="w-8 h-14 border-2 border-gray-400 rounded-full flex justify-center items-start p-1 cursor-pointer">
                <div className="w-1 h-3 bg-gray-400 rounded-full animate-bounce"></div>
            </div>
        </a>
    </div>
);

const ShaderPlane = () => {
    const { viewport } = useThree();
    const mesh = useRef(null);
    const uniforms = useMemo(
        () => ({
            u_color: { value: new THREE.Color(0x1ac6ff) },
            u_background: { value: new THREE.Vector4(0.0039, 0.0941, 0.1647, 1.0) },
            u_speed: { value: 0.252 },
            u_detail: { value: 0.225 },
            u_time: { value: 0 },
            u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
            u_resolution: { value: new THREE.Vector2(typeof window !== 'undefined' ? window.innerWidth : 1920, typeof window !== 'undefined' ? window.innerHeight : 1080) },
        }),
        []
    );
    useFrame((state) => {
        const { clock, mouse, size } = state;
        if (mesh.current) {
            mesh.current.material.uniforms.u_time.value = clock.getElapsedTime();
            mesh.current.material.uniforms.u_mouse.value.x = mouse.x / 2 + 0.5;
            mesh.current.material.uniforms.u_mouse.value.y = mouse.y / 2 + 0.5;
            if (mesh.current.material.uniforms.u_resolution.value.x !== size.width || mesh.current.material.uniforms.u_resolution.value.y !== size.height) {
                mesh.current.material.uniforms.u_resolution.value.set(size.width, size.height);
            }
        }
    });
    return (
        <mesh ref={mesh} scale={[viewport.width, viewport.height, 1]}>
            <planeGeometry args={[1, 1]} />
            <shaderMaterial
                key={Date.now()}
                glslVersion={THREE.GLSL1}
                fragmentShader={` precision highp float; uniform vec2 u_resolution; uniform float u_time; uniform vec3 u_color; uniform vec4 u_background; uniform float u_speed; uniform float u_detail; mat2 m(float a) { float c=cos(a), s=sin(a); return mat2(c,-s,s,c); } float map(vec3 p) { float t = u_time * u_speed; p.xz *= m(t * 0.4); p.xy*= m(t * 0.1); vec3 q = p * 2.0 + t; return length(p+vec3(sin((t*u_speed) * 0.1))) * log(length(p) + 0.9) + cos(q.x + sin(q.z + cos(q.y))) * 0.5 - 1.0; } void main() { vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y; vec3 cl = vec3(0.0); float d = 2.5; for (float i = 0.; i <= (1. + 20. * u_detail); i++) { vec3 p = vec3(0, 0, 4.0) + normalize(vec3(uv, -1.0)) * d; float rz = map(p); float f =  clamp((rz - map(p + 0.1)) * 0.5, -0.1, 1.0); vec3 l = vec3(0.1, 0.3, 0.4) + vec3(5.0, 2.5, 3.0) * f; cl = cl * l + smoothstep(2.5, 0.0, rz) * 0.6 * l; d += min(rz, 1.0); } vec4 color = vec4(min(u_color, cl),1.0); color.r = max(u_background.r,color.r); color.g = max(u_background.g,color.g); color.b = max(u_background.b,color.b); gl_FragColor = color; }`}
                vertexShader={` void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); } `}
                uniforms={uniforms}
            />
        </mesh>
    );
};

const CartIcon = ({ className, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.658-.463 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
  </svg>
);

export default function HomePage() {
    const router = useRouter();
    const { cartItems, isClient } = useCart();
    
    // Calcular total de itens de forma segura para SSR
    const totalItems = useMemo(() => {
        if (!isClient || !Array.isArray(cartItems)) return 0;
        return cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    }, [cartItems, isClient]);
    
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const isMobile = useIsMobile();

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                console.log('🔄 Carregando produtos...');
                
                // Usar a nova API de produtos
                const response = await fetch('/api/products');
                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.products) {
                        setProducts(result.products);
                        console.log('✅ Produtos carregados:', result.products.length, 'fonte:', result.source);
                    }
                } else {
                    console.warn('⚠️ Erro na API de produtos:', response.status);
                    setProducts([]);
                }
            } catch (error) {
                console.error("❌ Erro ao buscar produtos:", error);
                setProducts([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);
    
    // Converter produtos locais para formato compatível com ProductCard
    const toArray = (val) => Array.isArray(val) ? val : (typeof val === 'string' ? val.split(/[\s,]+/).filter(Boolean) : []);
    const convertedProducts = products.map(product => ({
        ...product,
        images: product.moreImages || [product.mainImage],
        price: product.sizes?.[0]?.price || 0,
        tags: toArray(product.tags),
    }));

    const readyMadeProducts = convertedProducts.filter(p => {
        return p.prontaEntrega || (p.sizes && p.sizes.some(size => size.prontaEntrega));
    });

    const filteredCatalog = convertedProducts.filter(product => {
        const matchesFilter = activeFilter === "all" || (Array.isArray(product.tags) && product.tags.includes(activeFilter));
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || (Array.isArray(product.tags) && product.tags.join(" ").toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center">
                <LoadingSpinner size="xl" className="mb-6" />
                <p className="text-brand-gray-light text-xl font-medium">Carregando produtos...</p>
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <header className="bg-brand-black/90 backdrop-blur-md sticky top-0 z-50 border-b border-brand-gray-border/20 animate-fade-in">
                <nav className="container mx-auto px-4 sm:px-6 py-4" role="navigation" aria-label="Menu principal">
                    <div className="flex justify-between items-center">
                        {/* Logo */}
                        <Link href="/" className="flex items-center cursor-pointer group" aria-label="Voltar para página inicial">
                            <img
                                src="/assets/WIDE LOGO.svg"
                                alt="Logo da PENRØSE"
                                width={120}
                                height={32}
                                className="h-8 w-auto transition-transform duration-300 group-hover:scale-105"
                                loading="eager"
                            />
                        </Link>
                        
                        {/* Menu centralizado */}
                        <div className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
                            <Link href="#sobre" className="text-brand-gray hover:text-brand-blue transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-blue rounded px-2 py-1" aria-label="Ir para seção A Marca">A Marca</Link>
                            <Link href="#pronta-entrega" className="text-brand-gray hover:text-brand-blue transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-blue rounded px-2 py-1" aria-label="Ir para seção Pronta Entrega">Pronta Entrega</Link>
                            <Link href="#catalogo" className="text-brand-gray hover:text-brand-blue transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-blue rounded px-2 py-1" aria-label="Ir para seção Catálogo">Catálogo</Link>
                            <Link href="#contato" className="text-brand-gray hover:text-brand-blue transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-blue rounded px-2 py-1" aria-label="Ir para seção Contato">Contato</Link>
                        </div>

                        {/* Ações do lado direito */}
                        <div className="hidden md:flex items-center gap-6">
                            <a 
                                href="#catalogo" 
                                className="bg-gradient-to-r from-brand-blue to-brand-blue-dark hover:from-brand-blue-light hover:to-brand-blue text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 focus:ring-offset-brand-black"
                                aria-label="Ver catálogo de Action Figures"
                            >
                                Ver Action Figures
                            </a>
                            
                            <button 
                                onClick={() => router.push('/login')}
                                className="text-brand-gray hover:text-white transition-all duration-300 font-medium px-4 py-2 rounded-lg hover:bg-brand-gray-dark/50 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                aria-label="Fazer login"
                            >
                                Entrar
                            </button>
                            
                            <Link 
                                href="/carrinho" 
                                className="relative text-brand-gray hover:text-white transition-all duration-300 p-3 rounded-lg hover:bg-brand-gray-dark/50 focus:outline-none focus:ring-2 focus:ring-brand-blue group"
                                aria-label={`Carrinho de compras com ${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`}
                            >
                                <CartIcon className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                                {totalItems > 0 && (
                                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-brand-error rounded-full animate-pulse-slow shadow-medium">
                                        {totalItems > 99 ? '99+' : totalItems}
                                    </span>
                                )}
                            </Link>
                        </div>

                        {/* Versão mobile */}
                        <div className="md:hidden flex items-center gap-4">
                            <button 
                                onClick={() => router.push('/login')}
                                className="text-brand-gray-light hover:text-white transition-all duration-300 font-medium px-3 py-2 rounded-lg hover:bg-brand-gray-dark/50 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                aria-label="Fazer login"
                            >
                                Entrar
                            </button>
                            <Link 
                                href="/carrinho" 
                                className="relative text-brand-gray-light hover:text-white transition-all duration-300 p-2 rounded-lg group"
                                aria-label={`Carrinho com ${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`}
                            >
                                <CartIcon className="w-7 h-7 transition-transform duration-300 group-hover:scale-110" />
                                {totalItems > 0 && (
                                    <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-brand-error rounded-full animate-pulse-slow shadow-medium">
                                        {totalItems > 99 ? '99+' : totalItems}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>
                </nav>
            </header>
            
            <main>
                {/* Hero Section */}
                <section className="hero-section text-center relative h-screen flex items-center justify-center">
                    <div className="absolute inset-0 z-0">
                      {!isMobile && (
                          <Canvas camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 0, 5] }}>
                            <ShaderPlane />
                          </Canvas>
                      )}
                    </div>
                    <div className="relative z-10 flex flex-col items-center justify-center px-4">
                      <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight">
                          Onde seu{" "}
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">
                          hobby
                          </span>{" "}
                          se torna arte colecionável.
                      </h1>
                      <p className="mt-4 text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
                          Materializamos paixões e memórias em action figures e itens
                          personalizados de alta qualidade, fundindo tecnologia 3D e arte
                          manual.
                      </p>
                      <div className="mt-8">
                          <a href="#catalogo" className="bg-gradient-to-r from-[#00A9E0] to-[#01182A] hover:from-[#33c1f0] hover:to-[#01182A] text-white font-bold py-3 px-8 rounded-full text-lg transition-transform hover:scale-105 transform inline-block shadow-lg shadow-blue-500/20">
                          Explorar Coleções
                          </a>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#01182a] to-transparent z-10" />
                    <ScrollIndicator />
                </section>

                {/* Seção Sobre */}
                <section id="sobre" className="py-20 md:py-32 bg-[#01182a]">
                    <div className="container mx-auto px-4 sm:px-6">
                      <div className="text-center mb-12">
                          <h2 className="text-3xl md:text-4xl font-bold text-white">
                          Transformando Paixão em Arte
                          </h2>
                          <p className="mt-2 text-gray-400">
                          Nossa essência é a capacidade de tornar o complexo uma realidade
                          tangível.
                          </p>
                      </div>
                      <div className="grid md:grid-cols-3 gap-8 text-center">
                          <div className="bg-gray-900/50 p-8 rounded-xl shadow-lg border border-gray-800 transition-transform duration-300 hover:-translate-y-2">
                            <h3 className="text-2xl font-bold text-white mb-3">Tecnologia e Arte</h3>
                            <p className="text-gray-300">Utilizamos impressão 3D de ponta para precisão e acabamento manual detalhado para dar alma a cada peça.</p>
                          </div>
                          <div className="bg-gray-900/50 p-8 rounded-xl shadow-lg border border-gray-800 transition-transform duration-300 hover:-translate-y-2">
                            <h3 className="text-2xl font-bold text-white mb-3">Qualidade Excepcional</h3>
                            <p className="text-gray-300">Materiais premium e uma pintura impecável. Um pré-requisito para colecionadores que buscam um investimento que vale cada centavo.</p>
                          </div>
                          <div className="bg-gray-900/50 p-8 rounded-xl shadow-lg border border-gray-800 transition-transform duration-300 hover:-translate-y-2">
                            <h3 className="text-2xl font-bold text-white mb-3">Personalização Sob Demanda</h3>
                            <p className="text-gray-300">Criamos peças que o mercado de massa não atende. Sua visão é o nosso projeto, de personagens de nicho a criações únicas.</p>
                          </div>
                      </div>
                    </div>
                </section>

                {/* Seção Pronta Entrega */}
                <section id="pronta-entrega" className="py-20 md:py-32">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-white">Peças a Pronta Entrega</h2>
                            <p className="mt-2 text-gray-400">Obras exclusivas disponíveis para envio imediato. Estoque limitado.</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-8">
                            {readyMadeProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Seção Catálogo */}
                <section id="catalogo" className="py-20 md:py-32 bg-black">
                     <div className="container mx-auto px-4 sm:px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-white">Catálogo Completo</h2>
                            <p className="mt-2 text-gray-400">Explore nosso portfólio e encomende sua próxima obra de arte.</p>
                        </div>
                        <div className="flex flex-col items-center mb-12">
                            <input 
                                type="search" 
                                id="search-input" 
                                placeholder="Pesquisar por nome ou tag..." 
                                className="w-full max-w-lg px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none" 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                            />
                        </div>
                        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-12">
                            {["all", "anime", "serie", "filme", "dorama", "promocao"].map((filter) => (
                                <button 
                                    key={filter} 
                                    onClick={() => setActiveFilter(filter)} 
                                    className={`filter-btn px-4 py-2 rounded-lg transition-colors ${
                                        activeFilter === filter 
                                            ? "bg-blue-600 text-white" 
                                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                    }`}
                                >
                                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                </button>
                            ))}
                        </div>
                        <div className="flex flex-wrap justify-center gap-8">
                            {filteredCatalog.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Seção Contato */}
                <section id="contato" className="py-20 md:py-32">
                    <div className="container mx-auto px-4 sm:px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white">Transforme sua Ideia em Realidade</h2>
                        <p className="mt-2 text-gray-400 max-w-2xl mx-auto">Pronto para encomendar uma peça personalizada ou tirar uma dúvida?</p>
                        <div className="mt-8">
                            <a 
                                href="https://wa.me/5500000000000?text=Olá!%20Gostaria%20de%20falar%20sobre%20um%20projeto%20personalizado." 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform hover:scale-105 transform inline-block shadow-lg"
                            >
                                Fale Conosco no WhatsApp
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-black border-t border-gray-800">
                <div className="container mx-auto px-6 py-6 text-center text-gray-400">
                    <p>&copy; 2025 PENRØSE LTDA. Todos os direitos reservados.</p>
                    <p className="text-sm mt-1">
                        Onde seu hobby se torna arte colecionável.
                    </p>
                </div>
            </footer>
        </>
    );
}
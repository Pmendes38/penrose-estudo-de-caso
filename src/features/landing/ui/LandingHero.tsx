import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';

const HeroBackground = dynamic(() => import('@/src/shared/ui/three/HeroBackground'), {
  ssr: false,
  loading: () => <div className="h-screen" />,
});

export default function LandingHero() {
  return (
    <section className="relative h-screen flex items-center justify-center text-center">
      <div className="absolute inset-0 -z-10">
        <HeroBackground />
      </div>

      <header className="bg-brand-black/90 backdrop-blur-md fixed top-0 inset-x-0 z-50 border-b border-brand-gray-border/20">
        <nav className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" aria-label="Página inicial" className="flex items-center">
            <Image
              src="/assets/WIDE LOGO.svg"
              alt="Logo da PENRØSE"
              width={120}
              height={32}
              priority
            />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#sobre" className="text-brand-gray hover:text-brand-blue">A Marca</a>
            <a href="#pronta-entrega" className="text-brand-gray hover:text-brand-blue">Pronta Entrega</a>
            <a href="#catalogo" className="text-brand-gray hover:text-brand-blue">Catálogo</a>
            <a href="#contato" className="text-brand-gray hover:text-brand-blue">Contato</a>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <a
              href="#catalogo"
              className="bg-gradient-to-r from-brand-blue to-brand-blue-dark text-white font-semibold py-2.5 px-6 rounded-xl hover:from-brand-blue-light"
            >
              Ver Action Figures
            </a>
            <Link
              href="/login"
              className="text-brand-gray hover:text-white px-4 py-2 rounded-lg hover:bg-brand-gray-dark/50"
            >
              Entrar
            </Link>
            <Link
              href="/carrinho"
              className="relative text-brand-gray hover:text-white p-3 rounded-lg hover:bg-brand-gray-dark/50"
              aria-label="Carrinho"
            >
              {/* Ícone: pode reaproveitar seu CartIcon */}
              <svg viewBox="0 0 24 24" className="w-6 h-6" stroke="currentColor" fill="none" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.658-.463 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
              </svg>
            </Link>
          </div>
        </nav>
      </header>

      <div className="relative z-10 px-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight">
          Onde seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">hobby</span> se torna arte colecionável.
        </h1>
        <p className="mt-4 text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
          Materializamos paixões e memórias em action figures e itens personalizados de alta qualidade, fundindo tecnologia 3D e arte manual.
        </p>
        <div className="mt-8">
          <a
            href="#catalogo"
            className="bg-gradient-to-r from-[#00A9E0] to-[#01182A] hover:from-[#33c1f0] text-white font-bold py-3 px-8 rounded-full text-lg inline-block shadow-lg shadow-blue-500/20"
          >
            Explorar Coleções
          </a>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#01182a] to-transparent z-10" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
        <a href="#sobre" aria-label="Rolar para a próxima seção">
          <div className="w-8 h-14 border-2 border-gray-400 rounded-full flex justify-center items-start p-1 cursor-pointer">
            <div className="w-1 h-3 bg-gray-400 rounded-full animate-bounce"></div>
          </div>
        </a>
      </div>
    </section>
  );
}

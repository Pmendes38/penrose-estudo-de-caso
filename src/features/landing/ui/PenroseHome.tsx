import Image from 'next/image';
import Link from 'next/link';
import { Logo } from '@/shared/ui/Logo';
import AppHeader from '@/shared/ui/AppHeader';
import PenroseHero from './PenroseHero';
import CollectionCarousel from './CollectionCarousel';
import OfferCarousel from './OfferCarousel';
import StorefrontFooter from '@/shared/ui/StorefrontFooter';
import LandingCatalogPreview from './LandingCatalogPreview';

const products = [
  {
    id: 'pnr-013', name: 'Portgas D. Ace',
    universe: 'One Piece',
    image: '/assets/penrose/product-1.png',
    description: 'Reviva toda a intensidade de One Piece com esta estátua de Portgas D. Ace. A pintura, os detalhes e os efeitos translúcidos recriam suas chamas icônicas.',
  },
  {
    id: 'pnr-073', name: 'Adult Gon',
    universe: 'Hunter x Hunter',
    image: '/assets/penrose/product-2.png',
    description: 'A transformação lendária de Gon ganha forma nesta peça expressiva, com toda a força e emoção de seu momento mais marcante.',
  },
  {
    id: 'pnr-071', name: 'Alphonse',
    universe: 'Fullmetal Alchemist',
    image: '/assets/penrose/product-3.png',
    description: 'Uma peça imponente de Alphonse Elric, criada para traduzir a presença, a força e a lealdade do personagem em cada detalhe.',
  },
  {
    id: 'pnr-001', name: 'Gaara',
    universe: 'Naruto',
    image: '/assets/penrose/product-4.png',
    description: 'Gaara em sua juventude, com a icônica cabaça e o controle da areia, em uma peça que transmite intensidade e mistério.',
  },
  {
    id: 'pnr-018', name: 'Goku e Gohan',
    universe: 'Dragon Ball Z',
    image: '/assets/penrose/product-5.png',
    description: 'Pai e filho reunidos em uma cena carregada de energia, movimento e emoção para colecionadores de Dragon Ball Z.',
  },
];

const catalogFilters = ['Todos', 'Anime', 'Filme', 'Games', 'Universo DC', 'Universo Marvel'] as const;

function FeatureCard({ accent, title, children }: { accent: 'violet' | 'cyan' | 'orange'; title: string; children: React.ReactNode }) {
  return (
    <article className={`penrose-feature-card penrose-feature-${accent}`}>
      <h3>{title}</h3>
      <p>{children}</p>
    </article>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="penrose-section-title">
      <span />
      <h2>{children}</h2>
      <span />
    </div>
  );
}

export default function PenroseHome() {
  return (
    <main className="penrose-site">
      <div className="penrose-top-shell">
        <AppHeader home />
        <PenroseHero />
        <section className="penrose-feature-grid" aria-label="Diferenciais Penrose">
        <FeatureCard accent="violet" title="Tecnologia e Arte">Impressão 3D de alta precisão e acabamento manual para transformar cada peça em uma obra única.</FeatureCard>
        <FeatureCard accent="cyan" title="Qualidade Excepcional">Materiais premium, pintura impecável e atenção aos detalhes para colecionadores exigentes.</FeatureCard>
        <FeatureCard accent="orange" title="Personalização">Criamos o que o mercado de massa não oferece: personagens de nicho e projetos feitos para você.</FeatureCard>
        </section>
      </div>

      <section className="penrose-section penrose-collections">
        <SectionTitle>Coleções</SectionTitle>
        <div className="penrose-collections-actions">
          <Link href="/catalog" className="penrose-collections-more">Ver mais coleções</Link>
        </div>
        <CollectionCarousel />
      </section>

      <section className="penrose-section penrose-offers">
        <h2>Ofertas</h2>
        <OfferCarousel />
      </section>

      <section className="penrose-section penrose-catalog-preview">
        <h2>Catálogo Completo</h2>
        <LandingCatalogPreview products={products} filters={catalogFilters} />
      </section>

      <section className="penrose-why">
        <div className="penrose-why-heading">
          <p>Por que comprar na</p>
          <Logo className="h-12 w-auto md:h-16" />
        </div>
        <div className="penrose-why-grid">
          <article className="penrose-why-card why-blue">
            <div className="penrose-why-card-panel">
              <Image src="/assets/penrose/payment.svg" alt="" width={150} height={150} unoptimized />
              <h3>Resgate<br />pontos com a<br />compra</h3>
            </div>
            <p>Transforme suas compras em recompensas.</p>
          </article>
          <article className="penrose-why-card why-green">
            <div className="penrose-why-card-panel">
              <Image src="/assets/penrose/bank.svg" alt="" width={150} height={150} unoptimized />
              <h3>Método<br />de pagamento<br />flexível</h3>
            </div>
            <p>Você decide a forma de pagamento.</p>
          </article>
          <article className="penrose-why-card why-pink">
            <div className="penrose-why-card-panel">
              <Image src="/assets/penrose/quality.svg" alt="" width={150} height={150} unoptimized />
              <h3>Qualidade<br />excepcional<br />nos produtos</h3>
            </div>
            <p>Acabamento impecável em cada peça.</p>
          </article>
        </div>
        <div className="penrose-cta">
          <h2>Transforme sua ideia em realidade</h2>
          <p>Pronto para encomendar uma peça personalizada ou tirar uma dúvida?</p>
          <a href="https://wa.me/5500000000000" target="_blank" rel="noreferrer">Fale Conosco Pelo Whatsapp</a>
        </div>
      </section>

      <StorefrontFooter />
    </main>
  );
}

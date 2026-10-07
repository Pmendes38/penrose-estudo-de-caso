import Link from 'next/link';
import StorefrontBenefits from '@/shared/ui/StorefrontBenefits';
import AppHeader from '@/shared/ui/AppHeader';
import PenroseHero from './PenroseHero';
import CollectionCarousel from './CollectionCarousel';
import OfferCarousel from './OfferCarousel';
import type { Offer } from './OfferCarousel';
import { catalogProducts } from '@/features/products/catalog';
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

const currency = (cents: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
const offers: Offer[] = catalogProducts.flatMap((product) => {
  return [{
    name: `${product.name} · 30 cm`,
    href: `/product/${product.id}`,
    image: product.images[0],
    oldPrice: currency(240000),
    price: currency(180000),
    discount: '25% OFF',
    accent: '#00abff',
  }];
});

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

      {offers.length > 0 && <section className="penrose-section penrose-offers">
        <h2>Ofertas</h2><OfferCarousel offers={offers} />
      </section>}

      <section className="penrose-section penrose-catalog-preview">
        <h2>Catálogo Completo</h2>
        <LandingCatalogPreview filters={catalogFilters} />
      </section>

      <section className="penrose-why">
        <StorefrontBenefits />
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

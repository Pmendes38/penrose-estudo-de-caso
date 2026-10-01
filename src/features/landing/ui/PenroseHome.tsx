import Image from 'next/image';
import Link from 'next/link';
import { Logo } from '@/shared/ui/Logo';
import AppHeader from '@/shared/ui/AppHeader';
import PenroseHero from './PenroseHero';

const collections = [
  { title: 'Universo DC', image: '/assets/penrose/collection-dc.png', accent: '#d15dff' },
  { title: 'Universo Marvel', image: '/assets/penrose/collection-marvel.png', accent: '#ff0946' },
  { title: 'Dragon Ball', image: '/assets/penrose/collection-dragonball.png', accent: '#fbbc04' },
  { title: 'Naruto', image: '/assets/penrose/collection-naruto.png', accent: '#ff5e00' },
];

const products = [
  {
    name: 'Portgas D. Ace',
    universe: 'One Piece',
    image: '/assets/penrose/product-1.png',
    description: 'Reviva toda a intensidade de One Piece com esta estátua de Portgas D. Ace. A pintura, os detalhes e os efeitos translúcidos recriam suas chamas icônicas.',
  },
  {
    name: 'Adult Gon',
    universe: 'Hunter x Hunter',
    image: '/assets/penrose/product-2.png',
    description: 'A transformação lendária de Gon ganha forma nesta peça expressiva, com toda a força e emoção de seu momento mais marcante.',
  },
  {
    name: 'Alphonse',
    universe: 'Fullmetal Alchemist',
    image: '/assets/penrose/product-3.png',
    description: 'Uma peça imponente de Alphonse Elric, criada para traduzir a presença, a força e a lealdade do personagem em cada detalhe.',
  },
  {
    name: 'Gaara',
    universe: 'Naruto',
    image: '/assets/penrose/product-4.png',
    description: 'Gaara em sua juventude, com a icônica cabaça e o controle da areia, em uma peça que transmite intensidade e mistério.',
  },
  {
    name: 'Goku e Gohan',
    universe: 'Dragon Ball Z',
    image: '/assets/penrose/product-5.png',
    description: 'Pai e filho reunidos em uma cena carregada de energia, movimento e emoção para colecionadores de Dragon Ball Z.',
  },
];

const offers = [
  { name: 'Adult Gon', image: '/assets/penrose/product-9.png', oldPrice: 'R$ 399', price: 'R$ 319', discount: '20% OFF', accent: '#00abff' },
  { name: 'Vampira', image: '/assets/penrose/product-6.png', oldPrice: 'R$ 599', price: 'R$ 459', discount: '23% OFF', accent: '#d15dff' },
  { name: 'Asa Noturna', image: '/assets/penrose/product-8.png', oldPrice: 'R$ 1.190', price: 'R$ 890', discount: '26% OFF', accent: '#00ff73' },
  { name: 'Wolverine', image: '/assets/penrose/product-7.png', oldPrice: 'R$ 699', price: 'R$ 549', discount: '21% OFF', accent: '#ffb800' },
];

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

function ProductCard({ product }: { product: (typeof products)[number] }) {
  return (
    <article className="penrose-product-card">
      <Link href="/catalog" className="penrose-product-image">
        <Image src={product.image} alt={product.name} fill sizes="(max-width: 768px) 46vw, 340px" />
      </Link>
      <div className="penrose-product-copy">
        <span>ANIME</span>
        <h3>{product.name}</h3>
        <p>{product.universe}</p>
        <p className="penrose-product-description-preview">{product.description}</p>
        <Link href="/catalog">Detalhes</Link>
      </div>
    </article>
  );
}

function Footer() {
  return (
    <footer id="sobre" className="penrose-footer">
      <div className="penrose-footer-brand">
        <Logo className="h-9 w-auto" />
        <p>Action figures, colecionáveis e projetos personalizados.</p>
        <div className="penrose-payments" aria-label="Formas de pagamento">
          {['visa', 'amex', 'mastercard', 'paypal', 'googlepay', 'elo'].map((name) => (
            <Image
              key={name}
              src={`/assets/penrose/payment-${name}.svg`}
              alt={name}
              width={35}
              height={24}
              unoptimized
            />
          ))}
        </div>
      </div>
      <div>
        <h3>Institucional</h3>
        <a href="#sobre">Quem Somos</a>
        <Link href="/privacy">Política de Privacidade</Link>
        <a href="mailto:contato@example.com">O Estúdio</a>
      </div>
      <div>
        <h3>Mais Informações</h3>
        <Link href="/shipping">Política de Entrega</Link>
        <Link href="/returns">Trocas e Devoluções</Link>
        <Link href="/coupons">Política de Promoções</Link>
      </div>
      <div>
        <h3>Suporte ao Cliente</h3>
        <a href="mailto:contato@example.com">Fale Conosco</a>
        <Link href="/customer">Minha Conta</Link>
        <Link href="/customer">Meus Pedidos</Link>
      </div>
      <small>© 2025 Projeto Penrose — Todos os direitos reservados.</small>
    </footer>
  );
}

export default function PenroseHome() {
  return (
    <main className="penrose-site">
      <AppHeader home />
      <PenroseHero />

      <section className="penrose-feature-grid" aria-label="Diferenciais Penrose">
        <FeatureCard accent="violet" title="Tecnologia e Arte">Impressão 3D de alta precisão e acabamento manual para transformar cada peça em uma obra única.</FeatureCard>
        <FeatureCard accent="cyan" title="Qualidade Excepcional">Materiais premium, pintura impecável e atenção aos detalhes para colecionadores exigentes.</FeatureCard>
        <FeatureCard accent="orange" title="Personalização">Criamos o que o mercado de massa não oferece: personagens de nicho e projetos feitos para você.</FeatureCard>
      </section>

      <section className="penrose-section penrose-collections">
        <SectionTitle>Coleções</SectionTitle>
        <div className="penrose-collections-actions">
          <Link href="/catalog" className="penrose-collections-more">Ver mais coleções</Link>
        </div>
        <div className="penrose-collection-gallery" aria-label="Galeria de coleções">
          {collections.map((collection) => (
            <Link href="/catalog" key={collection.title} className="penrose-collection-card" style={{ '--card-accent': collection.accent } as React.CSSProperties}>
              <Image src={collection.image} alt={collection.title} fill sizes="(max-width: 768px) 47vw, 420px" />
              <span>{collection.title}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="penrose-section penrose-offers">
        <h2>Ofertas em destaque</h2>
        <div className="penrose-offer-gallery" aria-label="Produtos em promoção">
          {offers.map((offer) => (
            <Link href="/catalog" key={offer.name} className="penrose-offer-card" style={{ '--offer-accent': offer.accent } as React.CSSProperties}>
              <Image src={offer.image} alt={offer.name} fill sizes="(max-width: 768px) 44vw, 360px" />
              <span className="penrose-offer-badge">{offer.discount}</span>
              <span className="penrose-offer-info">
                <strong>{offer.name}</strong>
                <span><s>{offer.oldPrice}</s> <b>por {offer.price}</b></span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="penrose-section penrose-catalog-preview">
        <h2>Catálogo Completo</h2>
        <Link href="/catalog" className="penrose-search-field">Pesquisar por nome ou tag...</Link>
        <div className="penrose-filter-row">
          {['Todos', 'Anime', 'Filme', 'Games', 'Universo DC', 'Universo Marvel'].map((filter) => <span className={filter === 'Anime' ? 'active' : ''} key={filter}>{filter}</span>)}
        </div>
        <div className="penrose-product-gallery" aria-label="Prévia do catálogo">
          {products.map((product) => <ProductCard product={product} key={product.name} />)}
        </div>
      </section>

      <section className="penrose-why">
        <div className="penrose-why-heading">
          <p>Por que comprar na</p>
          <Logo className="h-12 w-auto md:h-16" />
        </div>
        <div className="penrose-why-grid">
          <article className="penrose-why-card why-blue">
            <Image src="/assets/penrose/points.svg" alt="" width={150} height={150} unoptimized />
            <h3>Resgate pontos com a compra</h3>
            <p>Transforme suas compras em recompensas.</p>
          </article>
          <article className="penrose-why-card why-green">
            <Image src="/assets/penrose/payment.svg" alt="" width={150} height={150} unoptimized />
            <h3>Método de pagamento flexível</h3>
            <p>Você decide a forma de pagamento.</p>
          </article>
          <article className="penrose-why-card why-pink">
            <Image src="/assets/penrose/quality.svg" alt="" width={150} height={150} unoptimized />
            <h3>Qualidade excepcional nos produtos</h3>
            <p>Acabamento impecável em cada peça.</p>
          </article>
        </div>
        <div className="penrose-cta">
          <strong>Transforme sua ideia em realidade</strong>
          <a href="https://wa.me/5500000000000" target="_blank" rel="noreferrer">Fale conosco no WhatsApp</a>
        </div>
      </section>

      <Footer />
    </main>
  );
}

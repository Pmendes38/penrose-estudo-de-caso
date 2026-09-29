import Image from 'next/image';
import Link from 'next/link';
import { Logo } from '@/shared/ui/Logo';

const collections = [
  { title: 'Universo DC', image: '/assets/penrose/collection-dc.png', accent: '#d15dff' },
  { title: 'Universo Marvel', image: '/assets/penrose/collection-marvel.png', accent: '#ff0946' },
  { title: 'Dragon Ball', image: '/assets/penrose/collection-dragonball.png', accent: '#fbbc04' },
  { title: 'Naruto', image: '/assets/penrose/collection-naruto.png', accent: '#ff5e00' },
];

const products = [
  { name: 'Portgas D. Ace', universe: 'One Piece', image: '/assets/penrose/product-7.png', price: 'R$ 459,00' },
  { name: 'Adult Gon', universe: 'Hunter x Hunter', image: '/assets/penrose/product-2.png', price: 'R$ 319,00' },
  { name: 'Alphonse', universe: 'Fullmetal Alchemist', image: '/assets/penrose/product-8.png', price: 'R$ 259,00' },
  { name: 'Gaara', universe: 'Naruto', image: '/assets/penrose/product-9.png', price: 'R$ 359,00' },
  { name: 'Anakin Skywalker', universe: 'Star Wars', image: '/assets/penrose/product-5.png', price: 'R$ 1.800,00' },
];

const offers = [
  { name: 'Aquaman', image: '/assets/penrose/product-6.png' },
  { name: 'Vampira', image: '/assets/penrose/product-2.png' },
  { name: 'Asa Noturna', image: '/assets/penrose/product-3.png' },
  { name: 'Lanterna Verde', image: '/assets/penrose/product-4.png' },
];

function Icon({ children }: { children: React.ReactNode }) {
  return <span className="penrose-header-icon">{children}</span>;
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 8h12l1 13H5L6 8Z" />
      <path d="M9 9V6a3 3 0 0 1 6 0v3" />
    </svg>
  );
}

function PenroseHeader() {
  return (
    <header className="penrose-header">
      <Link href="/" aria-label="Página inicial">
        <Logo className="h-7 w-auto md:h-9" />
      </Link>
      <nav className="penrose-nav" aria-label="Navegação principal">
        <Link href="/catalog">Catálogo</Link>
        <Link href="/customer">Pedidos</Link>
        <a href="#sobre">Sobre Nós</a>
      </nav>
      <div className="penrose-header-actions">
        <Link href="/catalog" aria-label="Pesquisar">
          <Icon><SearchIcon /></Icon>
        </Link>
        <Link href="/cart" aria-label="Carrinho">
          <Icon><BagIcon /></Icon>
        </Link>
        <Link href="/login" className="penrose-avatar" aria-label="Minha conta">
          <Image src="/assets/penrose/product-5.png" alt="" fill sizes="40px" />
        </Link>
      </div>
    </header>
  );
}

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
        <strong>{product.price}</strong>
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
        <Link href="/terms">Política de Privacidade</Link>
        <a href="mailto:contato@example.com">O Estúdio</a>
      </div>
      <div>
        <h3>Mais Informações</h3>
        <Link href="/shipping">Política de Entrega</Link>
        <Link href="/terms">Trocas e Devoluções</Link>
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
      <PenroseHeader />

      <section className="penrose-hero">
        <div className="penrose-hero-copy">
          <h1>Onde seu hobby se torna<br />arte colecionável.</h1>
          <p>Materializamos paixões e memórias em action figures e itens personalizados de alta qualidade, fundindo tecnologia 3D e arte manual.</p>
        </div>
      </section>

      <section className="penrose-feature-grid" aria-label="Diferenciais Penrose">
        <FeatureCard accent="violet" title="Tecnologia e Arte">Impressão 3D de alta precisão e acabamento manual para transformar cada peça em uma obra única.</FeatureCard>
        <FeatureCard accent="cyan" title="Qualidade Excepcional">Materiais premium, pintura impecável e atenção aos detalhes para colecionadores exigentes.</FeatureCard>
        <FeatureCard accent="orange" title="Personalização">Criamos o que o mercado de massa não oferece: personagens de nicho e projetos feitos para você.</FeatureCard>
      </section>

      <section className="penrose-section penrose-collections">
        <SectionTitle>Coleções</SectionTitle>
        <div className="penrose-collection-grid">
          {collections.map((collection) => (
            <Link href="/catalog" key={collection.title} className="penrose-collection-card" style={{ '--card-accent': collection.accent } as React.CSSProperties}>
              <Image src={collection.image} alt={collection.title} fill sizes="(max-width: 768px) 47vw, 420px" />
              <span>{collection.title}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="penrose-section penrose-offers">
        <h2>Black Friday</h2>
        <div className="penrose-offer-grid">
          {offers.map((offer) => (
            <Link href="/catalog" key={offer.name} className="penrose-offer-card">
              <Image src={offer.image} alt={offer.name} fill sizes="(max-width: 768px) 44vw, 360px" />
              <span>{offer.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="penrose-section penrose-catalog-preview">
        <h2>Catálogo Completo</h2>
        <Link href="/catalog" className="penrose-search-field">Pesquisar por nome ou tag...</Link>
        <div className="penrose-filter-row">
          {['Todos', 'Anime', 'Games', 'Filmes', 'Séries'].map((filter, index) => <span className={index === 0 ? 'active' : ''} key={filter}>{filter}</span>)}
        </div>
        <div className="penrose-product-grid">
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
            <Image src="/assets/penrose/points.svg" alt="" width={150} height={150} />
            <h3>Resgate pontos com a compra</h3>
            <p>Transforme suas compras em recompensas.</p>
          </article>
          <article className="penrose-why-card why-green">
            <Image src="/assets/penrose/payment.svg" alt="" width={150} height={150} />
            <h3>Método de pagamento flexível</h3>
            <p>Você decide a forma de pagamento.</p>
          </article>
          <article className="penrose-why-card why-pink">
            <Image src="/assets/penrose/quality.svg" alt="" width={150} height={150} />
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

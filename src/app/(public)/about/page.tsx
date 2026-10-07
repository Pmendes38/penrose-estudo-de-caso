import Image from 'next/image';
import StorefrontBenefits from '@/shared/ui/StorefrontBenefits';

export const metadata = { title: 'Sobre Nós | Penrose' };

export default function AboutPage() {
  return (
    <article className="penrose-about-page">
      <header className="penrose-about-hero">
        <h1>Sobre Nós</h1>
        <p>A PENRØSE é um estúdio apaixonado pela criação de action figures artesanais, fundado com o objetivo de entregar qualidade e diferencial. Com uma proposta inovadora, buscamos unir o universo da cultura pop e do anime com um toque artesanal único.</p>
      </header>
      <section className="penrose-about-founders" aria-labelledby="founders-title">
        <h2 id="founders-title">Fundadores</h2>
        <article className="penrose-about-founder">
          <Image className="penrose-about-portrait portrait-pedro" src="/assets/penrose/about-pedro.jpg" alt="Pedro Mendes, cofundador da Penrose" width={713} height={712} sizes="(max-width: 760px) 90vw, 40vw" />
          <div>
            <h3>Pedro Mendes</h3>
            <p className="penrose-about-role">CMO (Diretor de Marketing)</p>
            <p className="penrose-about-bio">Pedro é o nosso especialista em marketing e comercial, responsável por levar a essência da PENRØSE ao público, conectando a marca com os fãs e criando estratégias que destacam nosso trabalho.</p>
          </div>
        </article>
        <article className="penrose-about-founder founder-ravel">
          <Image className="penrose-about-portrait" src="/assets/penrose/about-ravel.png" alt="Ravel Bandeira, cofundador da Penrose" width={715} height={712} sizes="(max-width: 760px) 90vw, 40vw" />
          <div>
            <h3>Ravel Bandeira</h3>
            <p className="penrose-about-role">COO (Diretor de Operações)</p>
            <p className="penrose-about-bio">À frente do processo criativo e produtivo da PENRØSE, atua como diretor criativo e responsável pela elaboração de cada peça artesanal. É ele quem transforma ideias em realidade, conduzindo cada etapa — desde a concepção artística até o acabamento final.</p>
          </div>
        </article>
      </section>
      <section id="studio" className="penrose-about-studio" aria-labelledby="studio-title">
        <Image className="penrose-about-divider" src="/assets/penrose/about-divider.svg" alt="" width={1180} height={8} unoptimized />
        <h2 id="studio-title">Estúdio</h2>
        <p>Na PENRØSE, valorizamos a qualidade em cada detalhe. Nossos action figures são feitos em resina, o que garante não só durabilidade, mas também um acabamento impecável. Nosso compromisso é oferecer um diferencial: cada peça é pensada para encantar, com uma identidade visual própria, embalagens exclusivas e um cuidado especial em cada etapa da produção.</p>
      </section>
      <section className="penrose-why" aria-label="Por que comprar na Penrose">
        <StorefrontBenefits />
      </section>
    </article>
  );
}

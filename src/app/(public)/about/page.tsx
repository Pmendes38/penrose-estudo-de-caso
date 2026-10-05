export const metadata = { title: 'Quem Somos | Penrose' };

export default function AboutPage() {
  return (
    <article className="penrose-about-page">
      <header className="penrose-about-hero">
        <span>SOBRE A PENROSE</span>
        <h1>Onde seu hobby se torna<br /><em>arte colecionável.</em></h1>
        <p>Materializamos paixões e memórias em action figures e itens personalizados de alta qualidade, unindo tecnologia 3D e trabalho manual.</p>
      </header>
      <section className="penrose-about-values" aria-label="Nossos valores">
        <article><strong>01</strong><h2>Tecnologia e Arte</h2><p>Impressão 3D de alta precisão e acabamento manual para transformar cada peça em uma obra única.</p></article>
        <article><strong>02</strong><h2>Qualidade Excepcional</h2><p>Materiais premium, pintura impecável e atenção aos detalhes para colecionadores exigentes.</p></article>
        <article><strong>03</strong><h2>Personalização</h2><p>Criamos o que o mercado de massa não oferece: personagens de nicho e projetos feitos para você.</p></article>
      </section>
      <section id="studio" className="penrose-about-studio">
        <div><span>O ESTÚDIO</span><h2>Detalhes que transformam<br />impressão em presença.</h2></div>
        <div><p>A Penrose nasceu para aproximar o imaginário da sua estante. Cada peça é desenvolvida com cuidado, desde a modelagem até a pintura e o acabamento final.</p><p>Para conversar sobre um projeto personalizado, escreva para <a href="mailto:contato@example.com">contato@example.com</a>.</p></div>
      </section>
    </article>
  );
}

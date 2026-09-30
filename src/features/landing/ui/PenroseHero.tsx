'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const slides = [
  {
    image: '/assets/penrose/hero.png',
    imageAlt: 'Action figure do Aquaman em cenário submarino',
    imageClassName: 'penrose-hero-image-portrait',
    title: <>Onde seu hobby se torna<br />arte colecionável.</>,
    description: 'Materializamos paixões e memórias em action figures e itens personalizados de alta qualidade, fundindo tecnologia 3D e arte manual.',
  },
  {
    image: '/assets/penrose/product-2.png',
    imageAlt: 'Action figure de Gon em pose de combate',
    title: <>Personagens que atravessam<br />histórias.</>,
    description: 'Peças expressivas, produzidas para preservar cada detalhe dos universos que fazem parte da sua história.',
  },
  {
    image: '/assets/penrose/product-3.png',
    imageAlt: 'Action figure de Alphonse Elric',
    title: <>Detalhes que transformam<br />impressão em arte.</>,
    description: 'Modelagem, acabamento e pintura se encontram em uma produção cuidadosa, pensada para colecionadores exigentes.',
  },
  {
    image: '/assets/penrose/product-4.png',
    imageAlt: 'Action figure de Gaara',
    title: <>Sua coleção, feita<br />para ser única.</>,
    description: 'Projetos personalizados dão forma a personagens, memórias e ideias que não existem nas prateleiras comuns.',
  },
  {
    image: '/assets/penrose/product-6.png',
    imageAlt: 'Action figure do Aquaman',
    title: <>Do imaginário direto<br />para a sua estante.</>,
    description: 'Tecnologia 3D e trabalho manual reunidos para criar peças com presença, personalidade e acabamento premium.',
  },
];

export default function PenroseHero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <section
      className="penrose-hero"
      aria-roledescription="carrossel"
      aria-label="Destaques Penrose"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="penrose-hero-slides">
        {slides.map((slide, index) => (
          <article
            className={`penrose-hero-slide${index === active ? ' is-active' : ''}`}
            aria-hidden={index !== active}
            key={slide.image + index}
          >
            <div className="penrose-hero-media" aria-hidden="true">
              <Image
                src={slide.image}
                alt=""
                fill
                priority={index === 0}
                sizes="(max-width: 700px) 82vw, 58vw"
                className={slide.imageClassName ?? 'penrose-hero-image-square'}
              />
            </div>
            <div className="penrose-hero-copy">
              <h1>{slide.title}</h1>
              <p>{slide.description}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="penrose-hero-indicators" role="group" aria-label="Selecionar destaque">
        {slides.map((slide, index) => (
          <button
            type="button"
            key={slide.image + index}
            className={index === active ? 'is-active' : ''}
            aria-label={`Mostrar destaque ${index + 1}`}
            aria-current={index === active ? 'true' : undefined}
            onClick={() => setActive(index)}
          />
        ))}
      </div>
    </section>
  );
}

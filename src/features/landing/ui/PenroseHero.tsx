'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const slides = [
  {
    image: '/assets/penrose/figma-aquaman.jpg',
    imageAlt: 'Action figure do Aquaman em cenário submarino',
    imageClassName: 'penrose-hero-image-aquaman',
    title: ['Onde seu hobby se torna', 'arte colecionável.'],
    description: 'Materializamos paixões e memórias em action figures e itens personalizados de alta qualidade, fundindo tecnologia 3D e arte manual.',
  },
  {
    image: '/assets/penrose/figma-gaara.jpg',
    imageAlt: 'Action figure de Gaara',
    imageClassName: 'penrose-hero-image-gaara',
    titleClassName: 'penrose-hero-title-long',
    title: ['Personagens que', 'atravessam histórias.'],
    description: 'Peças expressivas, produzidas para preservar cada detalhe dos universos que fazem parte da sua história.',
  },
  {
    image: '/assets/penrose/figma-superman.jpg',
    imageAlt: 'Action figure do Superman',
    imageClassName: 'penrose-hero-image-superman',
    titleClassName: 'penrose-hero-title-long',
    title: ['Detalhes que transformam', 'impressão em arte.'],
    description: 'Modelagem, acabamento e pintura se encontram em uma produção cuidadosa, pensada para colecionadores exigentes.',
  },
  {
    image: '/assets/penrose/figma-alphonse.jpg',
    imageAlt: 'Action figure de Alphonse Elric',
    imageClassName: 'penrose-hero-image-alphonse',
    title: ['Sua coleção, feita', 'para ser única.'],
    description: 'Projetos personalizados dão forma a personagens, memórias e ideias que não existem nas prateleiras comuns.',
  },
  {
    image: '/assets/penrose/figma-batman.jpg',
    imageAlt: 'Action figure do Batman',
    imageClassName: 'penrose-hero-image-batman',
    title: ['Do imaginário direto', 'para a sua estante.'],
    description: 'Tecnologia 3D e trabalho manual reunidos para criar peças com presença, personalidade e acabamento premium.',
  },
  {
    image: '/assets/penrose/figma-luffy.jpg',
    imageAlt: 'Action figure de Monkey D. Luffy',
    imageClassName: 'penrose-hero-image-luffy',
    title: ['Onde seu hobby se torna', 'arte colecionável.'],
    description: 'Materializamos paixões e memórias em action figures e itens personalizados de alta qualidade, fundindo tecnologia 3D e arte manual.',
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
                width={1500}
                height={1800}
                priority={index === 0}
                sizes="(max-width: 700px) 82vw, 55vw"
                className={slide.imageClassName}
              />
              {slide.imageClassName === 'penrose-hero-image-gaara' && (
                <Image src="/assets/penrose/figma-hero-noise-overlay.png" alt="" fill sizes="100vw" className="penrose-hero-figma-overlay" />
              )}
            </div>
            <div className="penrose-hero-copy">
              <h1 className={slide.titleClassName}>
                {slide.title.map((line) => <span key={line}>{line}</span>)}
              </h1>
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

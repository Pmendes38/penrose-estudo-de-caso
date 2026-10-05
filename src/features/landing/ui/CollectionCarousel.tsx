'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import type { PointerEvent } from 'react';

const collections = [
  { title: 'Universo DC', href: '/catalog?category=Universo+DC', image: '/assets/penrose/collection-dc.png', accent: '#d15dff' },
  { title: 'Universo Marvel', href: '/catalog?category=Marvel', image: '/assets/penrose/collection-marvel.png', accent: '#ff0946' },
  { title: 'Dragon Ball', href: '/catalog?search=Goku', image: '/assets/penrose/collection-dragonball.png', accent: '#fbbc04' },
  { title: 'Naruto', href: '/catalog?search=Naruto', image: '/assets/penrose/collection-naruto.png', accent: '#ff5e00' },
];

type DragState = { startX: number; startScrollLeft: number; active: boolean; moved: boolean };

export default function CollectionCarousel() {
  const galleryRef = useRef<HTMLDivElement>(null);
  const drag = useRef<DragState>({ startX: 0, startScrollLeft: 0, active: false, moved: false });

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    const gallery = galleryRef.current;
    if (!gallery) return;
    drag.current = { startX: event.clientX, startScrollLeft: gallery.scrollLeft, active: true, moved: false };
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const gallery = galleryRef.current;
    const current = drag.current;
    if (!gallery || !current.active) return;
    const distance = event.clientX - current.startX;
    if (!current.moved && Math.abs(distance) < 6) return;
    if (!current.moved) {
      current.moved = true;
      gallery.setPointerCapture(event.pointerId);
      gallery.classList.add('is-dragging');
    }
    gallery.scrollLeft = current.startScrollLeft - distance;
  }

  function onPointerEnd(event: PointerEvent<HTMLDivElement>) {
    const gallery = galleryRef.current;
    drag.current.active = false;
    if (gallery?.hasPointerCapture(event.pointerId)) gallery.releasePointerCapture(event.pointerId);
    gallery?.classList.remove('is-dragging');
  }

  return (
    <div
      ref={galleryRef}
      className="penrose-collection-gallery"
      role="region"
      aria-label="Galeria de coleções — deslize para ver mais"
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onClickCapture={(event) => {
        if (drag.current.moved) {
          event.preventDefault();
          event.stopPropagation();
          drag.current.moved = false;
        }
      }}
    >
      {collections.map((collection) => (
        <Link href={collection.href} key={collection.title} className="penrose-collection-card" style={{ '--card-accent': collection.accent } as React.CSSProperties} draggable={false}>
          <Image src={collection.image} alt={collection.title} fill sizes="(max-width: 768px) 78vw, 420px" draggable={false} />
          <span>{collection.title}</span>
        </Link>
      ))}
    </div>
  );
}

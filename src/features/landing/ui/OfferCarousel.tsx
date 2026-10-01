'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent } from 'react';

const offers = [
  { name: 'Adult Gon', image: '/assets/penrose/product-9.png', oldPrice: 'R$ 399', price: 'R$ 319', discount: '20% OFF', accent: '#00abff' },
  { name: 'Vampira', image: '/assets/penrose/product-6.png', oldPrice: 'R$ 599', price: 'R$ 459', discount: '23% OFF', accent: '#d15dff' },
  { name: 'Asa Noturna', image: '/assets/penrose/product-8.png', oldPrice: 'R$ 1.190', price: 'R$ 890', discount: '26% OFF', accent: '#00ff73' },
  { name: 'Wolverine', image: '/assets/penrose/product-7.png', oldPrice: 'R$ 699', price: 'R$ 549', discount: '21% OFF', accent: '#ffb800' },
];

export default function OfferCarousel() {
  const galleryRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ x: 0, scroll: 0, active: false, moved: false });
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  function updateControls() {
    const gallery = galleryRef.current;
    if (!gallery) return;
    setCanGoBack(gallery.scrollLeft > 2);
    setCanGoForward(gallery.scrollLeft < gallery.scrollWidth - gallery.clientWidth - 2);
  }

  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery) return;
    const observer = new ResizeObserver(updateControls);
    observer.observe(gallery);
    gallery.scrollLeft = gallery.scrollWidth - gallery.clientWidth;
    updateControls();
    return () => observer.disconnect();
  }, []);

  function move(direction: -1 | 1) {
    const gallery = galleryRef.current;
    if (!gallery) return;
    const card = gallery.querySelector<HTMLElement>('.penrose-offer-card');
    gallery.scrollBy({ left: direction * ((card?.offsetWidth ?? 399) + 32), behavior: 'smooth' });
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    const gallery = galleryRef.current;
    if (!gallery) return;
    drag.current = { x: event.clientX, scroll: gallery.scrollLeft, active: true, moved: false };
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const gallery = galleryRef.current;
    const current = drag.current;
    if (!gallery || !current.active) return;
    const delta = event.clientX - current.x;
    if (!current.moved && Math.abs(delta) < 6) return;
    if (!current.moved) {
      current.moved = true;
      gallery.setPointerCapture(event.pointerId);
      gallery.classList.add('is-dragging');
    }
    gallery.scrollLeft = current.scroll - delta;
  }

  function onPointerEnd(event: PointerEvent<HTMLDivElement>) {
    const gallery = galleryRef.current;
    drag.current.active = false;
    if (gallery?.hasPointerCapture(event.pointerId)) gallery.releasePointerCapture(event.pointerId);
    gallery?.classList.remove('is-dragging');
  }

  return (
    <div className="penrose-offer-carousel">
      <button className="penrose-offer-arrow" type="button" aria-label="Ver ofertas anteriores" disabled={!canGoBack} onClick={() => move(-1)}>←</button>
      <div className={`penrose-offer-viewport${canGoForward ? ' is-clipped-right' : ''}`}>
        <div
          ref={galleryRef}
          className="penrose-offer-gallery"
          role="region"
          aria-label="Produtos em promoção — deslize para ver mais"
          tabIndex={0}
          onScroll={updateControls}
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
          {offers.map((offer) => (
            <Link href="/catalog" key={offer.name} className="penrose-offer-card" style={{ '--offer-accent': offer.accent } as CSSProperties} draggable={false}>
              <span className="penrose-offer-visual">
                <Image src={offer.image} alt={offer.name} fill sizes="(max-width: 768px) 78vw, 360px" draggable={false} />
                <span className="penrose-offer-badge">{offer.discount}</span>
              </span>
              <span className="penrose-offer-info">
                <strong>{offer.name}</strong>
                <span><s>{offer.oldPrice}</s> <b>por {offer.price}</b></span>
              </span>
            </Link>
          ))}
        </div>
      </div>
      <button className="penrose-offer-arrow" type="button" aria-label="Ver próximas ofertas" disabled={!canGoForward} onClick={() => move(1)}>→</button>
    </div>
  );
}

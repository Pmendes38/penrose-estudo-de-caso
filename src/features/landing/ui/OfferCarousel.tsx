'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import type { CSSProperties, PointerEvent, TransitionEvent } from 'react';

export type Offer = { name: string; href: string; image: string; oldPrice: string; price: string; discount: string; accent: string };

export default function OfferCarousel({ offers }: { offers: Offer[] }) {
  const [firstOffer, setFirstOffer] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const pointer = useRef({ x: 0, active: false, suppressClickUntil: 0 });
  const visibleOffers = Array.from({ length: offers.length + 1 }, (_, index) => offers[(firstOffer + index) % offers.length]);

  function advance() {
    if (!isMoving) setIsMoving(true);
  }

  function finishMove(event: TransitionEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget || event.propertyName !== 'transform') return;
    setFirstOffer((current) => (current + 1) % offers.length);
    setIsMoving(false);
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    pointer.current = { x: event.clientX, active: true, suppressClickUntil: 0 };
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!pointer.current.active) return;
    pointer.current.active = false;
    if (pointer.current.x - event.clientX > 50) {
      pointer.current.suppressClickUntil = Date.now() + 500;
      advance();
    }
  }

  return (
    <div className="penrose-offer-carousel">
      <button className="penrose-offer-arrow" type="button" aria-label="Deslizar ofertas para a esquerda" onClick={advance}>←</button>
      <div
        className="penrose-offer-viewport"
        role="region"
        aria-label="Ofertas. Arraste para a esquerda para continuar do início."
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { pointer.current.active = false; }}
        onClickCapture={(event) => {
          if (Date.now() < pointer.current.suppressClickUntil) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
      >
        <div className={`penrose-offer-gallery${isMoving ? ' is-moving' : ''}`} onTransitionEnd={finishMove}>
          {visibleOffers.map((offer, index) => (
            <Link href={offer.href} key={`${offer.name}-${index}`} className="penrose-offer-card" style={{ '--offer-accent': offer.accent } as CSSProperties} draggable={false} aria-hidden={index === offers.length} tabIndex={index === offers.length ? -1 : 0}>
              <span className="penrose-offer-visual">
                <Image src={offer.image} alt={index === offers.length ? '' : offer.name} fill sizes="(max-width: 640px) 78vw, (max-width: 1000px) 42vw, 25vw" draggable={false} />
                {offer.discount && <span className="penrose-offer-badge">{offer.discount}</span>}
              </span>
              <span className={`penrose-offer-info${offer.discount ? '' : ' no-discount'}`}>
                <strong>{offer.name}</strong>
                <span>{offer.oldPrice && <s>{offer.oldPrice}</s>} <b>{offer.oldPrice ? 'por ' : ''}{offer.price}</b></span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

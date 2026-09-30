'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ClearCartOnMount from '@/features/cart/clear-on-mount';
import { useState } from 'react';
import { Logo } from '@/shared/ui/Logo';

export default function ThankYouClient() {
  const orderId=useSearchParams().get('order')||'';
  const [email,setEmail]=useState('');
  return <div className="penrose-confirmed-page">
    <ClearCartOnMount/>
    <Link href="/" className="confirmed-close" aria-label="Fechar">×</Link>
    <div className="confirmed-mark"><span>✓</span></div>
    <Logo className="h-10 w-auto"/>
    <p className="confirmed-kicker">PEDIDO CONFIRMADO</p>
    <h1>Obrigado por comprar<br/>com a Penrose!</h1>
    <p className="confirmed-copy">Recebemos seu pedido e nossa equipe já está preparando tudo para falar com você. Em breve, ajudaremos você a encontrar a action figure perfeita para sua coleção! Fique de olho no seu e-mail — e prepare-se para o próximo nível do colecionismo!</p>
    {orderId&&<p className="confirmed-order">PEDIDO <strong>#{orderId}</strong></p>}
    <div className="confirmed-actions"><Link href="/customer">ACOMPANHAR PEDIDO</Link><Link href="/catalog">CONTINUAR COMPRANDO</Link></div>
    <form className="confirmed-newsletter" onSubmit={(e)=>e.preventDefault()}><h2>FIQUE POR DENTRO</h2><p>Receba lançamentos e novidades exclusivas.</p><div><input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Seu melhor e-mail"/><button>QUERO RECEBER</button></div></form>
    <div className="confirmed-social"><a href="#" aria-label="Instagram">IG</a><a href="#" aria-label="Facebook">FB</a><a href="#" aria-label="YouTube">YT</a></div>
  </div>;
}

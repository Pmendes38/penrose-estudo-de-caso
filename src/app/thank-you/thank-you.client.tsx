'use client';

import Link from 'next/link';
import ClearCartOnMount from '@/features/cart/clear-on-mount';

const socialIcons = ['facebook', 'instagram', 'tiktok', 'youtube', 'whatsapp'] as const;

export default function ThankYouClient({ orderId, demo = false }: { orderId?: string; demo?: boolean }) {

  return <section className="penrose-confirmed-page">
    {orderId && <ClearCartOnMount />}
    <Link href="/" className="confirmed-close" aria-label="Voltar à página inicial"><img src="/assets/penrose/confirmation-close.svg" alt="" /></Link>
    {orderId ? <div className="confirmed-content">
      <h1>{demo ? 'Pedido de demonstração confirmado!' : 'Obrigado por comprar com a PENROSE!'}</h1>
      {demo ? <p>O pedido fictício foi salvo e está disponível na sua conta e no ERP.<br />Nenhuma cobrança, entrega ou mensagem real será realizada.</p> : <p>Recebemos seu pedido e nossa equipe já está preparando tudo para falar com você.<br />Em breve, ajudaremos você a encontrar a action figure perfeita para sua coleção!<br />Fique de olho no seu e-mail — e prepare-se para o <strong>próximo nível do colecionismo!</strong></p>}
      <p className="confirmed-order">Pedido <strong>#{orderId}</strong> · <Link href="/customer#pedidos">Acompanhar pedido</Link></p>
      <div className="confirmed-newsletter"><label htmlFor="confirmed-email">Receba Lançamentos e ações Exclusivas</label><div><input id="confirmed-email" type="email" placeholder="Receba Novidades e Ofertas no seu E-mail" disabled /><button type="button" disabled>Assinar</button></div><small>Inscrições em breve</small></div>
      <div className="confirmed-social" aria-label="Redes sociais em breve">{socialIcons.map((name) => <button type="button" key={name} disabled title={`${name}: em breve`} aria-label={`${name}: em breve`}><img src={`/assets/penrose/confirmation-${name}.svg`} alt="" /></button>)}</div>
    </div> : <div className="confirmed-content"><h1>Pedido não encontrado</h1><p>Abra esta página pelo link de confirmação enviado após a compra.</p><Link className="confirmed-back" href="/catalog">Explorar catálogo</Link></div>}
  </section>;
}

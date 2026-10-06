'use client';

import Link from 'next/link';
import { useState } from 'react';

const reasons = ['Escolhi o tamanho errado', 'Quero alterar a forma de pagamento', 'Desisti da compra'];

export default function CancelOrderForm({ orderNumber, returnUrl }: { orderNumber: number; returnUrl: string }) {
  const [reason, setReason] = useState(reasons[0]);
  const subject = `Solicitação de cancelamento do pedido #${orderNumber}`;
  const body = `Olá, equipe Penrose.\n\nSolicito a avaliação do cancelamento do pedido #${orderNumber}.\nMotivo: ${reason}.\n\nEntendo que a equipe confirmará a possibilidade de cancelamento e as condições do estorno.\n`;
  const emailHref = `mailto:contato@example.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return <div className="penrose-cancel-card">
    <img className="penrose-cancel-warning" src="/assets/penrose/cancel-warning.svg" alt="" width="48" height="48" />
    <h1>Cancelar pedido?</h1>
    <p>Você está solicitando o cancelamento do pedido #{orderNumber}. Nossa equipe confirmará a possibilidade de cancelamento e orientará sobre o estorno no meio de pagamento original.</p>
    <fieldset><legend>MOTIVO DO CANCELAMENTO</legend>{reasons.map((option) => <label key={option}><input type="radio" name="reason" value={option} checked={reason === option} onChange={() => setReason(option)} /><img className="selected" src="/assets/penrose/cancel-selected.svg" alt="" width="16" height="16" /><img className="unselected" src="/assets/penrose/cancel-unselected.svg" alt="" width="16" height="16" /><span>{option}</span></label>)}</fieldset>
    <small>Ao confirmar, seu aplicativo de e-mail abrirá com a solicitação pronta. Envie a mensagem para concluir o pedido de cancelamento; o status não muda automaticamente.</small>
    <div className="penrose-cancel-actions"><Link href={returnUrl}>VOLTAR AO PEDIDO</Link><a href={emailHref}>ABRIR E-MAIL</a></div>
  </div>;
}

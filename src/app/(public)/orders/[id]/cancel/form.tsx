'use client';

import Link from 'next/link';
import { useState } from 'react';
import { requestCancellationAction } from './actions';

const reasons = ['Escolhi o tamanho errado', 'Quero alterar a forma de pagamento', 'Desisti da compra'];

export default function CancelOrderForm({ orderId, orderNumber, returnUrl, alreadyRequested }: { orderId: string; orderNumber: number; returnUrl: string; alreadyRequested: boolean }) {
  const [reason, setReason] = useState(reasons[0]);
  const [saved, setSaved] = useState(alreadyRequested);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  async function submit() {
    setPending(true); setError('');
    try {
      const result = await requestCancellationAction(orderId, reason);
      if (result.ok) setSaved(true); else setError(result.error ?? 'Não foi possível enviar a solicitação.');
    } catch {
      setError('Falha de conexão. Tente enviar novamente.');
    } finally {
      setPending(false);
    }
  }

  return <div className="penrose-cancel-card">
    <img className="penrose-cancel-warning" src="/assets/penrose/cancel-warning.svg" alt="" width="48" height="48" />
    <h1>{saved ? 'Solicitação recebida' : 'Solicitar cancelamento?'}</h1>
    <p>{saved ? `Sua solicitação do pedido #${orderNumber} foi salva e está disponível para análise no ERP.` : `Envie o motivo para solicitar o cancelamento do pedido #${orderNumber}. O pedido não será cancelado nem estornado automaticamente.`}</p>
    {!saved && <fieldset disabled={pending}><legend>MOTIVO DO CANCELAMENTO</legend>{reasons.map((option) => <label key={option}><input type="radio" name="reason" value={option} checked={reason === option} onChange={() => setReason(option)} /><img className="selected" src="/assets/penrose/cancel-selected.svg" alt="" width="16" height="16" /><img className="unselected" src="/assets/penrose/cancel-unselected.svg" alt="" width="16" height="16" /><span>{option}</span></label>)}</fieldset>}
    <small>O status do pedido só muda após análise administrativa. Na demonstração, não há estorno financeiro real.</small>
    {error && <p role="alert">{error}</p>}
    {saved && <p role="status">Solicitação salva. Você pode voltar ao pedido.</p>}
    <div className="penrose-cancel-actions"><Link href={returnUrl}>VOLTAR AO PEDIDO</Link>{!saved && <button type="button" disabled={pending} onClick={submit}>{pending ? 'ENVIANDO…' : 'ENVIAR SOLICITAÇÃO'}</button>}</div>
  </div>;
}

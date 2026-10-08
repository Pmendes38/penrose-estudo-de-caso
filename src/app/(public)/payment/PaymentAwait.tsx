'use client';

import { useEffect, useRef, useState } from 'react';

type Props = { paymentId: string };

const TERMINALS = new Set(['CONFIRMED', 'CANCELED', 'REFUNDED', 'FAILED']);

export default function PaymentAwait({ paymentId }: Props) {
  const [error, setError] = useState<string>('');
  const [info, setInfo] = useState<{
    status?: string; billingType?: 'PIX'|'BOLETO'|'CREDIT_CARD';
    boletoUrl?: string; identificatorField?: string; pixPayload?: string; orderId?: string;
    provider?: string;
  }>({});
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let stopped = false;
    let attempt = 0;
    const MAX_DELAY = 10000; // 10s
    const MAX_TIME_MS = 3 * 60 * 1000; // 3 minutos
    const start = Date.now();

    async function tick() {
      if (stopped) return;
      if (Date.now() - start > MAX_TIME_MS) return;

      attempt += 1;
      const delay = Math.min(1000 * Math.pow(1.4, attempt), MAX_DELAY);

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        const res = await fetch(`/api/v1/payments/${encodeURIComponent(paymentId)}`, {
          cache: 'no-store',
          signal: abortRef.current.signal,
        });
        const p = await res.json();
        if (!res.ok) throw new Error(p.message || 'Não foi possível consultar o pagamento');

        setInfo({
          status: p.status,
          billingType: p.billingType,
          boletoUrl: p.boletoUrl,
          identificatorField: p.identificatorField,
          pixPayload: p.pixPayload,
          orderId: p.orderId,
          provider: p.provider,
        });

        if (p.status === 'CONFIRMED') {
          window.location.href = `/thank-you?order=${p.orderId}`;
          return;
        }
        if (!TERMINALS.has(p.status)) {
          setTimeout(tick, delay);
        }
      } catch (e: any) {
        setError(e?.message ?? 'Falha ao consultar pagamento');
        setTimeout(tick, delay);
      }
    }

    tick();
    return () => {
      stopped = true;
      abortRef.current?.abort();
    };
  }, [paymentId]);

  const isPix = info.billingType === 'PIX';
  const isBoleto = info.billingType === 'BOLETO';
  const isTerminal = info.status ? TERMINALS.has(info.status) : false;
  async function simulate(outcome: 'approve' | 'decline') {
    setError('');
    try {
      const res = await fetch(`/api/v1/payments/${encodeURIComponent(paymentId)}/demo/${outcome}`, { method: 'PUT' });
      const payment = await res.json();
      if (!res.ok) throw new Error(payment.message || 'Falha na simulação');
      if (payment.status === 'CONFIRMED') window.location.href = `/thank-you?order=${encodeURIComponent(payment.orderId)}`;
      else setInfo(payment);
    } catch (error: any) { setError(error.message); }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h2 className="text-xl font-semibold">Finalize seu pagamento</h2>
      <p className="text-brand-gray">Status: {info.status ?? 'carregando...'}</p>

      {info.provider === 'DEMO' && <div role="status"><h3>Pagamento de demonstração</h3><p>Nenhuma cobrança será feita. Não use seu aplicativo bancário nem informe dados de cartão.</p>{!isTerminal && <div className="flex gap-4"><button type="button" onClick={() => simulate('approve')} className="px-4 py-2 bg-brand-blue rounded">Simular aprovação</button><button type="button" onClick={() => simulate('decline')} className="px-4 py-2 border rounded">Simular recusa</button></div>}</div>}
      {isPix && info.provider !== 'DEMO' && (
        <div className="space-y-3">
          <p>Copie o código PIX abaixo e pague no seu app bancário:</p>
          <textarea
            readOnly
            className="w-full h-32 bg-brand-black border border-brand-gray-border rounded p-3"
            value={info.pixPayload ?? 'Gerando QR…'}
          />
          <button
            className="px-4 py-2 border rounded"
            onClick={() => navigator.clipboard.writeText(info.pixPayload ?? '')}
            disabled={!info.pixPayload}
          >
            Copiar código PIX
          </button>
          {/* opcional: renderizar QRCode aqui */}
        </div>
      )}

      {isBoleto && info.provider !== 'DEMO' && (
        <div className="space-y-3">
          {info.boletoUrl && (
            <a href={info.boletoUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-brand-blue rounded inline-block text-white">
              Abrir boleto
            </a>
          )}
          {info.identificatorField && (
            <>
              <p> Linha digitável: </p>
              <code className="block p-2 bg-brand-black border border-brand-gray-border rounded">{info.identificatorField}</code>
            </>
          )}
        </div>
      )}

      {error && <p role="alert" className="text-red-400">{error}</p>}

      {!isTerminal && (
        <p className="text-sm text-brand-gray">Esta página atualiza automaticamente a cada poucos segundos.</p>
      )}
      {isTerminal && info.status !== 'CONFIRMED' && (
        <div className="text-sm text-brand-gray space-y-2">
          <p>O pagamento foi finalizado com status: <strong>{info.status}</strong>.</p>
          {info.orderId && (
            <a className="underline" href={`/orders/${encodeURIComponent(info.orderId)}`}>Ver pedido</a>
          )}
        </div>
      )}
    </div>
  );
}

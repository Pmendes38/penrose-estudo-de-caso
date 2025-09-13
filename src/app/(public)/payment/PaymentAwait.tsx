'use client';

import { useEffect, useRef, useState } from 'react';

type Props = { paymentId: string };

const TERMINALS = new Set(['CONFIRMED', 'CANCELED', 'REFUNDED', 'FAILED']);

export default function PaymentAwait({ paymentId }: Props) {
  const [error, setError] = useState<string>('');
  const [info, setInfo] = useState<{
    status?: string; billingType?: 'PIX'|'BOLETO'|'CREDIT_CARD';
    boletoUrl?: string; identificatorField?: string; pixPayload?: string; orderId?: string;
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

        setInfo({
          status: p.status,
          billingType: p.billingType,
          boletoUrl: p.boletoUrl,
          identificatorField: p.identificatorField,
          pixPayload: p.pixPayload,
          orderId: p.orderId,
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

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h2 className="text-xl font-semibold">Finalize seu pagamento</h2>
      <p className="text-brand-gray">Status: {info.status ?? 'carregando...'}</p>

      {isPix && (
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

      {isBoleto && (
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

      {error && <p className="text-red-400">{error}</p>}

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

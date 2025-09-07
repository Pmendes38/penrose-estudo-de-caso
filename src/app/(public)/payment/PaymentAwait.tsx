'use client';

import { useEffect, useState } from 'react';

type Props = { paymentId: string };

export default function PaymentAwait({ paymentId }: Props) {
  const [error, setError] = useState<string>('');
  const [info, setInfo] = useState<{
    status?: string; billingType?: 'PIX'|'BOLETO'|'CREDIT_CARD';
    boletoUrl?: string; identificatorField?: string; pixPayload?: string; orderId?: string;
  }>({});

  useEffect(() => {
    let stop = false;

    async function fetchPayment() {
      try {
        const res = await fetch(`/api/payments/${paymentId}`, { cache: 'no-store' });
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
      } catch (e:any) {
        setError(e?.message ?? 'Falha ao consultar pagamento');
      }
      if (!stop) setTimeout(fetchPayment, 3000);
    }

    fetchPayment();
    return () => { stop = true; };
  }, [paymentId]);

  const isPix = info.billingType === 'PIX';
  const isBoleto = info.billingType === 'BOLETO';

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h2 className="text-xl font-semibold">Finalize seu pagamento</h2>
      <p className="text-brand-gray">Status: {info.status ?? 'carregando...'}</p>

      {isPix && (
        <div className="space-y-3">
          <p>Copie o código PIX abaixo e pague no seu app bancário:</p>
          <textarea readOnly className="w-full h-32 bg-brand-black border border-brand-gray-border rounded p-3"
            value={info.pixPayload ?? 'Gerando QR…'} />
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
            <a href={info.boletoUrl} target="_blank" className="px-4 py-2 bg-brand-blue rounded inline-block">
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

      <p className="text-sm text-brand-gray">Esta página atualiza automaticamente a cada poucos segundos.</p>
    </div>
  );
}

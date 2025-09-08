'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ClearCartOnMount from '@/features/cart/clear-on-mount';
import { useState } from 'react';

export default function ThankYouClient() {
  const sp = useSearchParams();
  const orderId = sp.get('order') || '';
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center">
      {/* Limpa carrinho e dados do checkout AO ENTRAR nesta página */}
      <ClearCartOnMount />

      <div className="max-w-md w-full mx-auto text-center px-6">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Obrigado pela compra! 🎉</h1>
          <p className="text-brand-gray-light text-lg leading-relaxed">
            Seu pedido foi recebido com sucesso e está sendo processado.
          </p>

          {orderId ? (
            <div className="mt-5 inline-flex items-center gap-2 rounded-md border border-brand-gray-border bg-brand-gray-dark px-3 py-2">
              <span className="text-sm text-brand-gray">ID do pedido:</span>
              <code className="text-sm text-brand-gray-light">{orderId}</code>
              <button
                onClick={copy}
                className="ml-2 rounded border border-brand-gray-border px-2 py-1 text-xs text-brand-gray-light hover:bg-white/10"
              >
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
              {/* ajuste a rota abaixo conforme seu dashboard de pedidos */}
              <Link
                href={`/account/orders/${orderId}`}
                className="ml-2 rounded border border-brand-gray-border px-2 py-1 text-xs text-brand-blue hover:bg-white/10"
              >
                Ver pedido
              </Link>
            </div>
          ) : null}
        </div>

        <div className="bg-brand-gray-dark rounded-lg p-6 mb-8 border border-brand-gray-border">
          <h2 className="text-xl font-semibold text-white mb-4">O que acontece agora?</h2>
          <div className="space-y-4 text-left">
            <Item titulo="Confirmação por e-mail" desc="Enviamos um e-mail com os detalhes do seu pedido" />
            <Item titulo="Produção personalizada" desc="Sua peça será produzida com cuidado artesanal" />
            <Item titulo="Acompanhe o envio" desc="Você receberá o código de rastreamento" />
          </div>
        </div>

        <div className="bg-brand-gray-dark rounded-lg p-6 mb-8 border border-brand-gray-border">
          <h3 className="text-lg font-semibold text-white mb-3">Precisa de ajuda?</h3>
          <p className="text-brand-gray text-sm mb-4">Nossa equipe está pronta para atender você</p>
          <a
            href="https://wa.me/5500000000000?text=Olá! Acabei de fazer um pedido e gostaria de acompanhar o status."
            target="_blank" rel="noopener noreferrer"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors inline-flex items-center"
          >
            💬 Falar no WhatsApp
          </a>
        </div>

        <div className="space-y-3">
          <Link href="/" className="w-full bg-brand-blue hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors inline-block">
            🏠 Voltar para a loja
          </Link>
          <Link href="/#catalogo" className="w-full bg-transparent border border-brand-gray-border hover:bg-brand-gray-dark text-brand-gray-light hover:text-white font-medium py-3 px-6 rounded-lg transition-colors inline-block">
            ✨ Ver mais produtos
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-brand-gray-border">
          <p className="text-brand-gray text-sm mb-4">Siga-nos nas redes sociais para novidades:</p>
          <div className="flex justify-center space-x-4">
            <a href="#" className="text-brand-gray hover:text-brand-blue transition-colors" aria-label="Instagram">📷 Instagram</a>
            <a href="#" className="text-brand-gray hover:text-brand-blue transition-colors" aria-label="Facebook">📘 Facebook</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Item({ titulo, desc }: { titulo: string; desc: string }) {
  return (
    <div className="flex items-start space-x-3">
      <div className="w-2 h-2 bg-brand-blue rounded-full mt-2 flex-shrink-0" />
      <div>
        <p className="text-white font-medium">{titulo}</p>
        <p className="text-brand-gray text-sm">{desc}</p>
      </div>
    </div>
  );
}

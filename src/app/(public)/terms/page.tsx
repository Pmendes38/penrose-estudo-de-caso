'use client';

import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Termos de Uso e Privacidade | Penrøse',
  description: 'Termos de uso e política de privacidade da Penrøse.',
};


export default function TermosPage() {
  return (
    <div className="min-h-screen bg-brand-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-brand-blue hover:text-blue-400 transition-colors mb-4"
          >
            ← Voltar para a loja
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4">
            Termos de Uso e Política de Privacidade
          </h1>
          <p className="text-brand-gray text-lg">
            Última atualização: Janeiro de 2025
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Termos de Uso */}
          <section className="bg-brand-gray-dark rounded-lg p-8 border border-brand-gray-border">
            <h2 className="text-2xl font-bold text-white mb-6">Termos de Uso</h2>
            
            <div className="space-y-6 text-brand-gray-light">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">1. Aceitação dos Termos</h3>
                <p>
                  Ao utilizar nosso site e serviços, você concorda com estes termos de uso. 
                  Caso não concorde, por favor, não utilize nossos serviços.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">2. Descrição dos Serviços</h3>
                <p>
                  A PENRØSE oferece action figures e itens colecionáveis personalizados de alta qualidade, 
                  produzidos através de impressão 3D e acabamento manual artístico.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">3. Produtos e Preços</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Todos os produtos são fabricados sob demanda</li>
                  <li>Preços podem ser alterados sem aviso prévio</li>
                  <li>Imagens são ilustrativas e podem haver pequenas variações no produto final</li>
                  <li>Prazo de produção varia de acordo com o produto</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">4. Pedidos e Pagamentos</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Aceitamos cartão de crédito e PIX</li>
                  <li>Pedidos são processados após confirmação do pagamento</li>
                  <li>Em caso de problemas técnicos, reservamo-nos o direito de cancelar pedidos</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">5. Entrega e Frete</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Entregamos para todo o Brasil via Correios</li>
                  <li>Frete grátis para pedidos acima de R$ 400,00</li>
                  <li>Prazo de entrega de 5 a 15 dias úteis após o envio</li>
                  <li>Não nos responsabilizamos por atrasos dos Correios</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">6. Política de Troca e Devolução</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Prazo de 7 dias corridos para solicitar troca (CDC)</li>
                  <li>Produto deve estar em perfeitas condições</li>
                  <li>Frete de devolução por conta do cliente, exceto em caso de defeito</li>
                  <li>Produtos personalizados não podem ser trocados, exceto por defeito</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Política de Privacidade */}
          <section className="bg-brand-gray-dark rounded-lg p-8 border border-brand-gray-border">
            <h2 className="text-2xl font-bold text-white mb-6">Política de Privacidade</h2>
            
            <div className="space-y-6 text-brand-gray-light">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">1. Coleta de Informações</h3>
                <p>
                  Coletamos informações fornecidas voluntariamente durante o cadastro, compras e 
                  interações com nosso site, incluindo nome, e-mail, telefone e endereço.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">2. Uso das Informações</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Processar e entregar pedidos</li>
                  <li>Comunicar sobre o status dos pedidos</li>
                  <li>Oferecer suporte ao cliente</li>
                  <li>Enviar newsletters (com consentimento)</li>
                  <li>Melhorar nossos serviços</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">3. Proteção de Dados</h3>
                <p>
                  Utilizamos medidas de segurança adequadas para proteger suas informações pessoais 
                  contra acesso, alteração, divulgação ou destruição não autorizados.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">4. Compartilhamento de Informações</h3>
                <p>
                  Não vendemos, trocamos ou transferimos suas informações pessoais para terceiros, 
                  exceto quando necessário para processar pedidos (correios, gateways de pagamento).
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">5. Cookies</h3>
                <p>
                  Utilizamos cookies para melhorar sua experiência de navegação, lembrar preferências 
                  e analisar o tráfego do site.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">6. Seus Direitos (LGPD)</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Solicitar acesso aos seus dados</li>
                  <li>Corrigir dados incompletos ou desatualizados</li>
                  <li>Solicitar exclusão de dados</li>
                  <li>Revogar consentimento</li>
                  <li>Portabilidade de dados</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Contato */}
          <section className="bg-brand-gray-dark rounded-lg p-8 border border-brand-gray-border">
            <h2 className="text-2xl font-bold text-white mb-6">Contato</h2>
            <div className="text-brand-gray-light space-y-2">
              <p>
                Para dúvidas sobre estes termos ou exercer seus direitos de privacidade:
              </p>
              <p>
                <strong className="text-white">WhatsApp:</strong> (00) 00000-0000
              </p>
              <p>
                <strong className="text-white">E-mail:</strong> contato@example.com
              </p>
              <p>
                <strong className="text-white">CNPJ:</strong> XX.XXX.XXX/0001-XX
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
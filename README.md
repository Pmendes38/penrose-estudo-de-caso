# Penrose — comércio eletrônico e ERP de estudo

Interface em Next.js, React, TypeScript e Tailwind CSS. Catálogo de colecionáveis, experiência de compra e painel administrativo para produtos produzidos sob encomenda.

> Cópia sanitizada de uma implementação real, não o repositório oficial. Leia [os limites e a preservação do histórico](ESTUDO-DE-CASO.md).

[API correspondente em NestJS e MongoDB](https://github.com/Pmendes38/penrose-api-estudo-de-caso)

## Fluxo demonstrado

Cliente pesquisa produtos → escolhe tamanho → cria conta → monta carrinho → aplica cupom → conclui pedido fictício → acompanha a produção.

Administrador acessa o ERP → gerencia produtos e cupons → localiza o cliente e o pedido → aprova pagamento simulado → cria O.S. → move a produção entre quatro etapas.

O fluxo foi verificado com compra fictícia. Não houve cobrança, emissão de etiqueta ou despacho real. A aprovação simulada não é uma alternativa para comprovar pagamentos reais.

## O que avaliar

- `src/features/`: catálogo, autenticação, carrinho, pedidos e pagamentos.
- `src/app/(public)/`: loja e conta do cliente.
- `src/app/(dashboard)/admin/`: ERP e quadro de produção.
- `src/shared/lib/`: valores, comunicação com a API e configurações.
- `scripts/check-order-money.cjs` e `scripts/check-admin-payments.cjs`: verificações das correções do funil.

## Executar localmente

Primeiro configure a API e o MongoDB locais no repositório correspondente. Cadastre os produtos necessários no ERP; esta cópia não contém dados de clientes ou pedidos de produção.

Copie `.env.example` para `.env.local`.

```sh
npm ci --legacy-peer-deps
npm run dev
```

## Validar

```sh
node scripts/check-order-money.cjs
node scripts/check-admin-payments.cjs
npm run vercel-build
```

Configure `NEXT_PUBLIC_API_BASE_URL` e `CART_API_BASE_URL` para uma API local e mantenha `COMMERCE_MODE=demo`. Não inclua credenciais de gateways ou serviços de produção. Dependências, segurança, contador de resgates de cupons e integrações reais exigem revisão antes de uso comercial.

As marcas e imagens de produtos continuam pertencendo aos respectivos titulares. O objetivo é permitir leitura, execução local e avaliação do desenvolvimento.

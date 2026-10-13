# Penrose — e-commerce e ERP

Interface em Next.js, React, TypeScript e Tailwind CSS. Catálogo de colecionáveis, experiência de compra e painel administrativo para produtos produzidos sob encomenda.

[Site](https://penrose.com.br/) · [Ver projeto no portfólio](https://portfolio-iota-woad-84p4egesbx.vercel.app/projetos/penrose) · [API em NestJS e MongoDB](https://github.com/Pmendes38/penrose-api-estudo-de-caso)

## Funcionalidades

- Catálogo, busca, categorias, produtos e seleção de tamanhos.
- Cadastro, autenticação e área do cliente.
- Carrinho, cupons, checkout e acompanhamento de pedidos.
- ERP com produtos, clientes, cupons, pedidos e pagamentos.
- Ordens de serviço e quadro de produção: A fazer → Impressão 3D → Acabamento → Pronto para envio.

## Estrutura

- `src/features/`: catálogo, autenticação, carrinho, pedidos e pagamentos.
- `src/app/(public)/`: loja e conta do cliente.
- `src/app/(dashboard)/admin/`: ERP e quadro de produção.
- `src/shared/lib/`: valores, comunicação com a API e configurações.
- `scripts/check-order-money.cjs` e `scripts/check-admin-payments.cjs`: verificações do funil.

## Executar localmente

Configure a API e o MongoDB locais no repositório correspondente. Cadastre os produtos necessários no ERP e copie `.env.example` para `.env.local`.

```sh
npm ci --legacy-peer-deps
npm run dev
```

Configure `NEXT_PUBLIC_API_BASE_URL` e `CART_API_BASE_URL` para a API local. O ambiente local usa `COMMERCE_MODE=demo`, que simula pagamentos e entregas.

## Validar

```sh
node scripts/check-order-money.cjs
node scripts/check-admin-payments.cjs
npm run vercel-build
```

## Histórico

O histórico registra a evolução da interface, do funil de pedidos e do quadro de produção.

Marcas e imagens de produtos pertencem aos respectivos titulares.

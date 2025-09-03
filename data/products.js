// Removed mock products file. Intentionally left blank; file will be deleted in a follow-up cleanup.

export const products = [
  {
    id: "venom",
    prontaEntrega: true, // Indica se o item pode ser de pronta entrega
    tags: ["marvel", "filme"],
    category: "Marvel",
    name: "Venom: Simbionte Dominador",
    description: `Uma obra de arte imponente do simbionte. Criada com impressão 3D em resina de alta qualidade e finalizada com pintura manual, esta peça captura a essência sombria do Venom. Ideal para colecionadores que buscam um item exclusivo e de alto impacto visual.`,
    mainImage: "/assets/products/venom/venom-1.jpg",
    moreImages: [
      "/assets/products/venom/venom-1.jpg",
      "/assets/products/venom/venom-2.jpg",
      "/assets/products/venom/venom-3.jpg",
      "/assets/products/venom/venom-4.jpg",
      "/assets/products/venom/venom-5.jpg",
    ],
    sizes: [
      { name: "20 cm", price: 529.90, prontaEntrega: true }, // Tamanho único de pronta entrega
    ],
    reviews: [
      {
      },
    ],
    // As dimensões abaixo podem ser do maior tamanho para uma base de cálculo de frete
    weight: 2,
    length: 45,
    width: 30,
    height: 25,
    material: "Resina Premium",
    material: "Resina Premium",
  },
  {
    id: "bucky",
    prontaEntrega: true,
    tags: ["marvel", "filme", "promocao"],
    category: "Marvel",
    name: "Soldado Invernal - Bucky Barnes",
    description: `Figura colecionável do Soldado Invernal, fiel ao personagem da Marvel. Produzida com impressão 3D de alta precisão e pintura manual, destaca-se pelo braço biônico e pela base narrativa com o escudo rachado. Uma peça de arte para colecionadores exigentes.`,
    mainImage: "/assets/products/soldadoinvernal/bucky-1.jpg",
    moreImages: [
      "/assets/products/soldadoinvernal/bucky-1.jpg",
      "/assets/products/soldadoinvernal/bucky-2.jpg",
      "/assets/products/soldadoinvernal/bucky-3.jpg",
      "/assets/products/soldadoinvernal/bucky-4.jpg",
    ],
    sizes: [
      { name: "20 cm", price: 250.00, prontaEntrega: true }, // Tamanho único de pronta entrega
    ],
    reviews: [
      {
      },
    ],
    weight: 1,
    length: 25,
    width: 15,
    height: 15,
    material: "Resina Premium",
    material: "Resina Premium",
  },
  {
    id: "escanor",
    prontaEntrega: true,
    tags: ["anime", "sete-pecados-capitais"],
    category: "Anime",
    name: "Escanor O Leão do Orgulho",
    description: `Action Figure de Escanor, o Leão do Orgulho. Produzida com impressão 3D de alta precisão e detalhes manuais, esta peça de The Seven Deadly Sins irradia poder e grandiosidade. Essencial para fãs que buscam uma obra com valor artístico.`,
    mainImage: "/assets/products/escanor/escanor-1.jpg",
    moreImages: [
      "/assets/products/escanor/escanor-1.jpg",
      "/assets/products/escanor/escanor-2.jpg",
    ],
    sizes: [
      { name: "20 cm", price: 229.90, prontaEntrega: true }, // Tamanho único de pronta entrega
    ],
    reviews: [
      {
      },
    ],
    weight: 0.8,
    length: 20,
    width: 12,
    height: 10,
    material: "Resina Premium",
    material: "Resina Premium",
  },
];
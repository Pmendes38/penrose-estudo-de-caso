import Head from 'next/head';

const SEO = ({
  title = 'Penrøse - Action Figures Exclusivos',
  description = 'Action Figures exclusivos e de alta qualidade da Penrøse. Personagens únicos com design diferenciado.',
  image = '/assets/WIDE LOGO.svg',
  url = 'https://exemplo.invalid',
  type = 'website',
  siteName = 'Penrøse',
  locale = 'pt_BR',
  keywords = 'action figures, colecionáveis, penrose, figuras de ação, personagens',
  author = 'Penrøse',
  price,
  currency = 'BRL',
  availability = 'instock',
  condition = 'new',
  brand = 'Penrøse',
  category,
  productId,
  rating,
  reviewCount
}) => {
  const fullTitle = title.includes('Penrøse') ? title : `${title} | Penrøse`;
  const fullUrl = url.startsWith('http') ? url : `https://exemplo.invalid${url}`;
  const fullImage = image.startsWith('http') ? image : `https://exemplo.invalid${image}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': type === 'product' ? 'Product' : 'Organization',
    name: title,
    description,
    url: fullUrl,
    logo: fullImage,
    ...(type === 'product' && {
      offers: {
        '@type': 'Offer',
        price: price?.toString(),
        priceCurrency: currency,
        availability: `https://schema.org/${availability}`,
        condition: `https://schema.org/${condition}Product`,
        seller: {
          '@type': 'Organization',
          name: brand
        }
      },
      brand: {
        '@type': 'Brand',
        name: brand
      },
      category,
      sku: productId,
      ...(rating && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: rating,
          reviewCount: reviewCount || 1
        }
      })
    })
  };

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index,follow" />
      <meta name="language" content="pt-BR" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImage} />
      
      {/* Product-specific meta tags */}
      {type === 'product' && price && (
        <>
          <meta property="product:price:amount" content={price} />
          <meta property="product:price:currency" content={currency} />
          <meta property="product:availability" content={availability} />
          <meta property="product:condition" content={condition} />
          <meta property="product:brand" content={brand} />
          {category && <meta property="product:category" content={category} />}
        </>
      )}
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd, null, 2)
        }}
      />
    </Head>
  );
};

export default SEO;
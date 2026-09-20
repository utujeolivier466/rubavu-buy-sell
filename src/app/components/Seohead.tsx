import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
}

const SITE_NAME = 'Rubavu Buy and Sell Ltd';
const DEFAULT_IMAGE = '/heroimage.jpeg';
const SITE_URL = 'https://www.rubavubuyandsell.com';

function SEOHead({ title, description, image, url, type = 'website', jsonLd, noindex }: SEOHeadProps) {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const resolvedImage = image ? image : DEFAULT_IMAGE;
  const ogImage = resolvedImage.startsWith('http') ? resolvedImage : `${SITE_URL}${resolvedImage}`;
  const canonicalUrl = url ? `${SITE_URL}${url}` : SITE_URL;

  const jsonLdArray = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph — controls the preview card on WhatsApp, Facebook, etc. */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter Card (same image also covers WhatsApp link previews) */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={fullTitle} />

      {/* Structured data */}
      {jsonLdArray.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}

export default SEOHead;


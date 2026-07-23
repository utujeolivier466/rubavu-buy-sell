import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}

const SITE_NAME = 'Rubavu Buy and Sell Ltd';
const DEFAULT_IMAGE = '/og-image.png';
const SITE_URL = 'https://rubavu-buy-sell.vercel.app';

function SEOHead({ title, description, image, url, type = 'website' }: SEOHeadProps) {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const resolvedImage = image ? image : DEFAULT_IMAGE;
  const ogImage = resolvedImage.startsWith('http') ? resolvedImage : `${SITE_URL}${resolvedImage}`;
  const canonicalUrl = url ? `${SITE_URL}${url}` : SITE_URL;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph — controls the preview card on WhatsApp, Facebook, etc. */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter Card (same image also covers WhatsApp link previews) */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}

export default SEOHead;
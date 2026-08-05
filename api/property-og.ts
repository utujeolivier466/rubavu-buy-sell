import { createClient } from '@supabase/supabase-js';

const SITE_URL = 'https://www.rubavubuyandsell.com';
const BOT_PATTERNS = [
  'facebookexternalhit',
  'whatsapp',
  'twitterbot',
  'linkedinbot',
  'slackbot',
  'telegrambot',
  'discordbot',
  'googlebot',
  'bingbot',
  'pinterest',
  'skypeuripreview',
  'applebot',
];

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function normalizeImage(image?: string | null) {
  if (!image) return `${SITE_URL}/heroimage.jpeg`;
  if (/^https?:\/\//i.test(image)) return image;
  if (image.startsWith('/')) return `${SITE_URL}${image}`;
  return `${SITE_URL}/${image}`;
}

function shouldServeOgTags(userAgent = '') {
  const ua = userAgent.toLowerCase();
  return BOT_PATTERNS.some((pattern) => ua.includes(pattern));
}

function renderPropertyHtml(property: {
  title: string;
  description?: string | null;
  location_text?: string | null;
  cover_image_url?: string | null;
  image_urls?: string[] | null;
  slug?: string | null;
}) {
  const title = property.title || 'Property Listing';
  const description = (property.description || property.location_text || 'View this property listing on Rubavu Buy and Sell.').slice(0, 160);
  const image = normalizeImage(property.image_urls?.[0] || property.cover_image_url || '/heroimage.jpeg');
  const canonicalUrl = `${SITE_URL}/properties/${property.slug || ''}`;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)} | Rubavu Buy and Sell</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:alt" content="${escapeHtml(title)}" />
    <meta property="og:site_name" content="Rubavu Buy and Sell" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="twitter:image:alt" content="${escapeHtml(title)}" />
  </head>
  <body>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(description)}</p>
  </body>
</html>`;
}

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get('slug') || url.pathname.replace(/^\/properties\//, '').replace(/\/+$/, '');
  const userAgent = request.headers.get('user-agent') || '';

  if (!slug || !shouldServeOgTags(userAgent)) {
    return new Response(null, { status: 404 });
  }

  const env = (globalThis as any).process?.env ?? {};
  const supabaseUrl = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL || '';
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response('OG metadata is unavailable because Supabase env vars are missing.', { status: 500 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabase
      .from('properties')
      .select('id, slug, title, description, location_text, cover_image_url, image_urls')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) {
      return new Response('Property not found', { status: 404 });
    }

    const html = renderPropertyHtml(data as any);
    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=60, s-maxage=60',
      },
    });
  } catch (error) {
    console.error('OG function failed:', error);
    return new Response('Server error', { status: 500 });
  }
}

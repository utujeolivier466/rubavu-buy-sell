import { createClient } from '@supabase/supabase-js';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');
const distDir = resolve(rootDir, 'dist');
const indexPath = resolve(distDir, 'index.html');

const siteUrl = process.env.SITE_URL || 'https://rubavu-buy-sell.vercel.app';
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeImage(image) {
  if (!image) return null;
  if (/^https?:\/\//i.test(image)) return image;
  if (image.startsWith('/')) return `${siteUrl}${image}`;
  return `${siteUrl}/${image}`;
}

function buildHeadTags({ title, description, image, url, type = 'website' }) {
  const resolvedTitle = escapeHtml(title || 'Rubavu Buy and Sell');
  const resolvedDescription = escapeHtml((description || '').slice(0, 160));
  const resolvedImage = normalizeImage(image || '/heroimage.jpeg');
  const resolvedUrl = url || siteUrl;

  return `
    <title>${resolvedTitle} | Rubavu Buy and Sell</title>
    <meta name="description" content="${resolvedDescription}" />
    <link rel="canonical" href="${resolvedUrl}" />
    <meta property="og:title" content="${resolvedTitle}" />
    <meta property="og:description" content="${resolvedDescription}" />
    <meta property="og:type" content="${type}" />
    <meta property="og:url" content="${resolvedUrl}" />
    <meta property="og:image" content="${resolvedImage}" />
    <meta property="og:image:alt" content="${resolvedTitle}" />
    <meta property="og:site_name" content="Rubavu Buy and Sell" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${resolvedTitle}" />
    <meta name="twitter:description" content="${resolvedDescription}" />
    <meta name="twitter:image" content="${resolvedImage}" />
    <meta name="twitter:image:alt" content="${resolvedTitle}" />
  `;
}

function extractAssetTags(indexHtml) {
  const assetTags = [];
  const scriptMatches = indexHtml.matchAll(/<script[^>]+src="([^"]+)"[^>]*><\/script>/g);
  for (const match of scriptMatches) {
    assetTags.push(`<script type="module" crossorigin src="${match[1]}"></script>`);
  }

  const linkMatches = indexHtml.matchAll(/<link[^>]+href="([^"]+)"[^>]*>/g);
  for (const match of linkMatches) {
    const href = match[1];
    if (href.includes('/assets/') || href.includes('.css')) {
      assetTags.push(`<link rel="stylesheet" crossorigin href="${href}">`);
    }
  }

  return assetTags.join('\n');
}

function buildPage({ title, description, image, url, type = 'website' }, assetTags) {
  const resolvedTitle = escapeHtml(title || 'Rubavu Buy and Sell');
  const head = buildHeadTags({ title: resolvedTitle, description, image, url, type });
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${head}
    ${assetTags}
  </head>
  <body>
    <div id="root"></div>
    <noscript>You need JavaScript enabled to view this page.</noscript>
    <script>
      window.__PROPERTY_PREVIEW__ = ${JSON.stringify({ title: resolvedTitle })};
    </script>
  </body>
</html>`;
}

async function writeRoutePage(routePath, metadata, assetTags, generatedRoutes) {
  const normalizedPath = routePath === '/' ? '' : routePath.replace(/^\/+|\/+$/g, '');
  const routeDir = normalizedPath ? resolve(distDir, normalizedPath) : distDir;
  const outputPath = normalizedPath ? resolve(routeDir, 'index.html') : resolve(distDir, 'index.html');
  await mkdir(routeDir, { recursive: true });
  await writeFile(outputPath, buildPage(metadata, assetTags), 'utf8');
  generatedRoutes.push(routePath);
}

async function main() {
  try {
    const indexHtml = await readFile(indexPath, 'utf8');
    const assetTags = extractAssetTags(indexHtml);

    let supabase = null;
    if (supabaseUrl && supabaseAnonKey) {
      supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    }

    const generatedRoutes = [];

    const staticRoutes = [
      {
        route: '/',
        title: 'Buy, Sell & Invest in Lake Kivu Properties',
        description: "Rubavu's trusted real estate partner. Title-ready waterfront properties, houses, land, and commercial spaces in Gisenyi and across Rubavu District.",
        image: '/heroimage.jpeg',
        type: 'website',
        url: `${siteUrl}/`,
      },
      {
        route: '/properties',
        title: 'Properties for Sale in Rubavu',
        description: 'Browse title-ready homes, waterfront properties, land, and commercial spaces in Rubavu and Gisenyi.',
        image: '/heroimage.jpeg',
        type: 'website',
        url: `${siteUrl}/properties`,
      },
      {
        route: '/blog',
        title: 'Rubavu Real Estate Insights',
        description: 'Articles, buying tips, and local market insights for property buyers and investors in Rubavu.',
        image: '/heroimage.jpeg',
        type: 'website',
        url: `${siteUrl}/blog`,
      },
      {
        route: '/about',
        title: 'About Rubavu Buy and Sell',
        description: 'Learn about our team, values, and the local expertise behind every real estate experience in Rubavu.',
        image: '/heroimage.jpeg',
        type: 'website',
        url: `${siteUrl}/about`,
      },
      {
        route: '/contact',
        title: 'Contact Rubavu Buy and Sell',
        description: 'Reach out for property listings, investment guidance, or support with buying or selling in Rubavu.',
        image: '/heroimage.jpeg',
        type: 'website',
        url: `${siteUrl}/contact`,
      },
      {
        route: '/sell-property',
        title: 'Sell Your Property in Rubavu',
        description: 'List your home, land, or commercial property with a trusted local team in Rubavu.',
        image: '/heroimage.jpeg',
        type: 'website',
        url: `${siteUrl}/sell-property`,
      },
      {
        route: '/faq',
        title: 'Frequently Asked Questions',
        description: 'Find answers about listings, buying, selling, investment advice, and the Rubavu property market.',
        image: '/heroimage.jpeg',
        type: 'website',
        url: `${siteUrl}/faq`,
      },
      {
        route: '/terms',
        title: 'Terms and Conditions',
        description: 'Review the terms and conditions for using Rubavu Buy and Sell services and content.',
        image: '/heroimage.jpeg',
        type: 'website',
        url: `${siteUrl}/terms`,
      },
      {
        route: '/privacy',
        title: 'Privacy Policy',
        description: 'Read how Rubavu Buy and Sell handles your personal information and data privacy.',
        image: '/heroimage.jpeg',
        type: 'website',
        url: `${siteUrl}/privacy`,
      },
    ];

    for (const route of staticRoutes) {
      if (route.route === '/') {
        await writeRoutePage(route.route, route, assetTags, generatedRoutes);
      } else {
        await writeRoutePage(route.route, route, assetTags, generatedRoutes);
      }
    }

    if (supabase) {
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('slug,title,description,cover_image_url,image_urls,location_text')
        .order('created_at', { ascending: false });

      if (propertyError) {
        console.warn('Unable to load properties for social preview generation:', propertyError.message);
      } else {
        for (const property of propertyData || []) {
          if (!property?.slug) continue;
          await writeRoutePage(`/properties/${property.slug}`, {
            title: property.title,
            description: property.description || property.location_text || '',
            image: property.image_urls?.[0] || property.cover_image_url || '/heroimage.jpeg',
            url: `${siteUrl}/properties/${property.slug}`,
            type: 'article',
          }, assetTags, generatedRoutes);
        }
      }

      const { data: blogData, error: blogError } = await supabase
        .from('blog_posts')
        .select('slug,title,excerpt,cover_image_url')
        .eq('published', true)
        .order('published_at', { ascending: false });

      if (blogError) {
        console.warn('Unable to load blog posts for social preview generation:', blogError.message);
      } else {
        for (const post of blogData || []) {
          if (!post?.slug) continue;
          await writeRoutePage(`/blog/${post.slug}`, {
            title: post.title,
            description: post.excerpt,
            image: post.cover_image_url || '/heroimage.jpeg',
            url: `${siteUrl}/blog/${post.slug}`,
            type: 'article',
          }, assetTags, generatedRoutes);
        }
      }
    }

    console.log(`Generated ${generatedRoutes.length} social preview page(s).`);
  } catch (error) {
    console.warn('Social preview page generation skipped:', error.message);
  }
}

main();

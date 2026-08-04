import { createClient } from '@supabase/supabase-js';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');
const distDir = resolve(rootDir, 'dist');
const indexPath = resolve(distDir, 'index.html');

const siteUrl = process.env.SITE_URL || 'https://www.rubavubuyandsell.com';
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
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

async function writeSitemap(entries) {
  const urls = entries
    .map(({ loc, lastmod, changefreq, priority }) => {
      return `  <url>
    <loc>${escapeHtml(loc)}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  await writeFile(resolve(distDir, 'sitemap.xml'), sitemap, 'utf8');
  console.log(`Wrote sitemap.xml with ${entries.length} URLs.`);
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

async function fetchAllRows(supabase, tableName, selectQuery, orderColumn, filters = []) {
  const pageSize = 1000;
  const rows = [];
  let offset = 0;

  while (true) {
    let query = supabase.from(tableName).select(selectQuery).range(offset, offset + pageSize - 1);

    if (orderColumn) {
      query = query.order(orderColumn, { ascending: false });
    }

    for (const filter of filters) {
      query = query[filter.method](filter.column, filter.value);
    }

    const { data, error } = await query;
    if (error) throw error;

    if (!data || data.length === 0) break;

    rows.push(...data);

    if (data.length < pageSize) break;
    offset += pageSize;
  }

  return rows;
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
        route: '/request-property',
        title: 'Request a Property in Rubavu',
        description: 'Tell us what you are looking for and our team will help find a matching property in Rubavu.',
        image: '/heroimage.jpeg',
        type: 'website',
        url: `${siteUrl}/request-property`,
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
      await writeRoutePage(route.route, route, assetTags, generatedRoutes);
    }

    // Build sitemap entries
    const sitemapEntries = staticRoutes.map((route) => ({
      loc: `${siteUrl}${route.route === '/' ? '/' : route.route}`,
      changefreq: ['/', '/properties', '/blog'].includes(route.route) ? 'daily' : 'monthly',
      priority: route.route === '/' ? '1.0' : route.route === '/properties' ? '0.9' : '0.6',
      lastmod: todayIso(),
    }));

    const sitemapDynamic = [];

    if (supabase) {
      try {
        const propertyData = await fetchAllRows(
          supabase,
          'properties',
          'id,slug,title,description,cover_image_url,image_urls,location_text,updated_at,created_at',
          'created_at',
        );

        for (const property of propertyData || []) {
          const routeSlug = property?.slug || property?.id;
          if (!routeSlug) continue;

          await writeRoutePage(`/properties/${routeSlug}`, {
            title: property.title,
            description: property.description || property.location_text || '',
            image: property.image_urls?.[0] || property.cover_image_url || '/heroimage.jpeg',
            url: `${siteUrl}/properties/${routeSlug}`,
            type: 'article',
          }, assetTags, generatedRoutes);

          sitemapDynamic.push({
            loc: `${siteUrl}/properties/${routeSlug}`,
            changefreq: 'weekly',
            priority: '0.8',
            lastmod: property.updated_at ? property.updated_at.slice(0, 10) : property.created_at ? property.created_at.slice(0, 10) : todayIso(),
          });
        }
      } catch (propertyError) {
        console.warn('Unable to load properties for social preview generation:', propertyError.message);
      }

      try {
        const blogData = await fetchAllRows(
          supabase,
          'blog_posts',
          'id,slug,title,excerpt,cover_image_url,updated_at,published_at',
          'published_at',
          [{ method: 'eq', column: 'published', value: true }],
        );

        for (const post of blogData || []) {
          const routeSlug = post?.slug || post?.id;
          if (!routeSlug) continue;

          await writeRoutePage(`/blog/${routeSlug}`, {
            title: post.title,
            description: post.excerpt,
            image: post.cover_image_url || '/heroimage.jpeg',
            url: `${siteUrl}/blog/${routeSlug}`,
            type: 'article',
          }, assetTags, generatedRoutes);

          sitemapDynamic.push({
            loc: `${siteUrl}/blog/${routeSlug}`,
            changefreq: 'monthly',
            priority: '0.7',
            lastmod: post.updated_at ? post.updated_at.slice(0, 10) : post.published_at ? post.published_at.slice(0, 10) : todayIso(),
          });
        }
      } catch (blogError) {
        console.warn('Unable to load blog posts for social preview generation:', blogError.message);
      }
    }

    await writeSitemap([...sitemapEntries, ...sitemapDynamic]);

    console.log(`Generated ${generatedRoutes.length} social preview page(s).`);
  } catch (error) {
    console.warn('Social preview page generation skipped:', error.message);
  }
}

main();


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

function buildHeadTags(property) {
  const title = escapeHtml(property.title || 'Property');
  const description = escapeHtml((property.description || property.location_text || '').slice(0, 160));
  const image = normalizeImage(property.image_urls?.[0] || property.cover_image_url || '/heroimage.jpeg');
  const url = `${siteUrl}/properties/${property.slug}`;

  return `
    <title>${title} | Rubavu Buy and Sell</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:alt" content="${title}" />
    <meta property="og:site_name" content="Rubavu Buy and Sell" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="twitter:image:alt" content="${title}" />
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

function buildPage(property, assetTags) {
  const title = escapeHtml(property.title || 'Property');
  const head = buildHeadTags(property);
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
    <noscript>You need JavaScript enabled to view this property listing.</noscript>
    <script>
      window.__PROPERTY_PREVIEW__ = ${JSON.stringify({ title })};
    </script>
  </body>
</html>`;
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
          const routeDir = resolve(distDir, 'properties', property.slug);
          await mkdir(routeDir, { recursive: true });
          const outputPath = resolve(routeDir, 'index.html');
          await writeFile(outputPath, buildPage(property, assetTags), 'utf8');
          generatedRoutes.push(`properties/${property.slug}`);
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
          const routeDir = resolve(distDir, 'blog', post.slug);
          await mkdir(routeDir, { recursive: true });
          const outputPath = resolve(routeDir, 'index.html');
          await writeFile(outputPath, buildPage({
            title: post.title,
            description: post.excerpt,
            cover_image_url: post.cover_image_url,
            slug: post.slug,
            image_urls: post.cover_image_url ? [post.cover_image_url] : [],
            location_text: 'Learning Center',
          }, assetTags), 'utf8');
          generatedRoutes.push(`blog/${post.slug}`);
        }
      }
    }

    console.log(`Generated ${generatedRoutes.length} social preview page(s).`);
  } catch (error) {
    console.warn('Social preview page generation skipped:', error.message);
  }
}

main();

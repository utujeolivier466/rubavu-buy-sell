import 'dotenv/config';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const dryRun = process.argv.includes('--dry-run');
const limitArgument = process.argv.find((argument) => argument.startsWith('--limit='));
const bucketArgument = process.argv.find((argument) => argument.startsWith('--bucket='));
const objectLimit = limitArgument ? Number.parseInt(limitArgument.split('=')[1], 10) : 10;
const bucketFilter = bucketArgument ? bucketArgument.split('=').slice(1).join('=') : null;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Set SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY before running this script.');
}

if (!Number.isInteger(objectLimit) || objectLimit < 1) {
  throw new Error('The --limit value must be a positive whole number.');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const references = [];

function addReference(table, id, field, value) {
  if (typeof value === 'string' && value) references.push({ table, id, field, value });
}

function extractStorageObject(url) {
  try {
    const parsed = new URL(url);
    const marker = '/storage/v1/object/public/';
    const markerIndex = parsed.pathname.indexOf(marker);
    if (markerIndex < 0) return null;

    const objectPath = parsed.pathname.slice(markerIndex + marker.length);
    const separatorIndex = objectPath.indexOf('/');
    if (separatorIndex < 1) return null;

    return {
      bucket: decodeURIComponent(objectPath.slice(0, separatorIndex)),
      path: decodeURIComponent(objectPath.slice(separatorIndex + 1)),
    };
  } catch {
    return null;
  }
}

function replaceReference(value, replacements) {
  return replacements.get(value) || value;
}

async function loadReferences() {
  const [submissions, properties, agents, blogPosts] = await Promise.all([
    supabase.from('property_submissions').select('id, photo_urls'),
    supabase.from('properties').select('id, image_urls, cover_image_url'),
    supabase.from('agents').select('id, photo_url'),
    supabase.from('blog_posts').select('id, cover_image_url'),
  ]);

  for (const result of [submissions, properties, agents, blogPosts]) {
    if (result.error) throw result.error;
  }

  for (const row of submissions.data || []) {
    for (const value of row.photo_urls || []) addReference('property_submissions', row.id, 'photo_urls', value);
  }
  for (const row of properties.data || []) {
    for (const value of row.image_urls || []) addReference('properties', row.id, 'image_urls', value);
    addReference('properties', row.id, 'cover_image_url', row.cover_image_url);
  }
  for (const row of agents.data || []) addReference('agents', row.id, 'photo_url', row.photo_url);
  for (const row of blogPosts.data || []) addReference('blog_posts', row.id, 'cover_image_url', row.cover_image_url);
}

async function updateReferences(replacements) {
  const grouped = new Map();

  for (const reference of references) {
    if (replaceReference(reference.value, replacements) === reference.value) continue;
    const key = `${reference.table}:${reference.id}`;
    if (!grouped.has(key)) grouped.set(key, { table: reference.table, id: reference.id });
  }

  for (const item of grouped.values()) {
    const fields = references.filter((reference) => reference.table === item.table && reference.id === item.id);
    const payload = {};

    for (const field of new Set(fields.map((reference) => reference.field))) {
      const fieldReferences = fields.filter((reference) => reference.field === field);
      if (field === 'photo_urls' || field === 'image_urls') {
        payload[field] = fieldReferences.map((reference) => replaceReference(reference.value, replacements));
      } else {
        payload[field] = replaceReference(fieldReferences[0].value, replacements);
      }
    }

    if (dryRun) {
      console.log(`[dry-run] update ${item.table}/${item.id}`, payload);
      continue;
    }

    const { error } = await supabase.from(item.table).update(payload).eq('id', item.id);
    if (error) throw error;
  }
}

async function main() {
  await loadReferences();

  const objects = new Map();
  for (const reference of references) {
    const object = extractStorageObject(reference.value);
    if (object) objects.set(`${object.bucket}/${object.path}`, object);
  }

  const selectedObjects = [];
  let convertedCount = 0;

  for (const object of objects.values()) {
    if (bucketFilter && object.bucket !== bucketFilter) continue;
    if (object.path.toLowerCase().endsWith('.webp')) continue;

    selectedObjects.push(object);
    try {
      const { data, error } = await supabase.storage.from(object.bucket).download(object.path);
      if (error) throw error;

      const newPath = object.path.replace(/\.[^.\/]+$/, '') + '.webp';
      const output = await sharp(Buffer.from(await data.arrayBuffer()))
        .rotate()
        .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
      const newUrl = supabase.storage.from(object.bucket).getPublicUrl(newPath).data.publicUrl;

      console.log(`${object.bucket}/${object.path} -> ${object.bucket}/${newPath} (${output.length} bytes)`);
      const replacements = new Map();
      for (const reference of references) {
        const parsed = extractStorageObject(reference.value);
        if (parsed?.bucket === object.bucket && parsed.path === object.path) {
          replacements.set(reference.value, newUrl);
        }
      }

      if (dryRun) {
        await updateReferences(replacements);
        convertedCount += 1;
        continue;
      }

      const { error: uploadError } = await supabase.storage.from(object.bucket).upload(newPath, output, {
        contentType: 'image/webp',
        cacheControl: '31536000',
        upsert: true,
      });
      if (uploadError) throw uploadError;

      try {
        await updateReferences(replacements);
      } catch (updateError) {
        await supabase.storage.from(object.bucket).remove([newPath]);
        throw updateError;
      }

      if (object.path !== newPath) {
        const { error: removeError } = await supabase.storage.from(object.bucket).remove([object.path]);
        if (removeError) throw removeError;
      }

      convertedCount += 1;
    } catch (error) {
      console.error(`Skipping ${object.bucket}/${object.path}: ${error.message}`);
    }

    if (convertedCount >= objectLimit) break;
  }

  if (dryRun) {
    console.log(`Dry run complete: ${convertedCount} object(s) would be converted.`);
    return;
  }

  console.log(`Completed: ${convertedCount} object(s) converted to WebP.`);
}

await main();
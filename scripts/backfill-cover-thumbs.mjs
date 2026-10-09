import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

config();

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const backupDirectory = join(scriptDirectory, 'backups', 'property-cover-thumbs');
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running the backfill.');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: properties, error } = await supabase
  .from('properties')
  .select('id, cover_image_url')
  .not('cover_image_url', 'is', null);

if (error) {
  throw new Error(`Unable to load properties: ${error.message}`);
}

await mkdir(backupDirectory, { recursive: true });

let processed = 0;
let skipped = 0;

for (const property of properties ?? []) {
  const sourceUrl = property.cover_image_url;
  if (!sourceUrl) {
    continue;
  }

  const objectName = sourceUrl.split('/property-images/')[1];
  if (!objectName) {
    continue;
  }

  const thumbName = `thumb_${objectName}`;

  const { data: existingThumb } = await supabase.storage.from('property-images').download(thumbName).catch(() => ({ data: null }));
  if (existingThumb) {
    skipped += 1;
    continue;
  }

  try {
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from('property-images')
      .download(objectName);

    if (downloadError) {
      throw new Error(`Unable to download ${objectName}: ${downloadError.message}`);
    }

    const originalBuffer = Buffer.from(await downloadData.arrayBuffer());
    const backupPath = join(backupDirectory, `${property.id}-${objectName}`);
    await writeFile(backupPath, originalBuffer);

    const thumbBuffer = await sharp(originalBuffer)
      .rotate()
      .resize({ width: 480, height: 360, fit: 'cover', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const { error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(thumbName, thumbBuffer, {
        contentType: 'image/webp',
        cacheControl: '31536000',
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Unable to upload ${thumbName}: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage.from('property-images').getPublicUrl(thumbName);

    const { error: updateError } = await supabase
      .from('properties')
      .update({ cover_thumb_url: publicUrlData.publicUrl })
      .eq('id', property.id);

    if (updateError) {
      throw new Error(`Unable to save thumb for ${property.id}: ${updateError.message}`);
    }

    processed += 1;
    console.log(`✓ ${property.id}: ${thumbName}`);
  } catch (error) {
    console.error(`✗ ${property.id}: ${error.message}`);
  }
}

console.log(`Processed ${processed} property thumbs; skipped ${skipped} existing thumbs.`);

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName = process.env.BUCKET || 'property-images';
const limit = Number.parseInt(process.env.LIMIT || '3', 10);
const allFiles = process.env.ALL_FILES === '1' || process.env.ALL === '1';
const backupDirectory = join(process.cwd(), 'backup');

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Set SUPABASE_URL (or VITE_SUPABASE_URL) and SERVICE_ROLE_KEY (or SUPABASE_SERVICE_ROLE_KEY) before running the backfill.');
}

if (!Number.isInteger(limit) || limit < 1) {
  throw new Error('LIMIT must be a positive integer.');
}

mkdirSync(backupDirectory, { recursive: true });

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: files, error: listError } = await supabase.storage.from(bucketName).list('', { limit: 1000 });
if (listError) {
  throw new Error(`Unable to list files in bucket ${bucketName}: ${listError.message}`);
}

const heavyFiles = (files ?? []).filter((file) => (file.metadata?.size ?? 0) > 300 * 1024);
const beforeCount = heavyFiles.length;
console.log(`Before: files over 300 KB = ${beforeCount}`);

const selectedFiles = allFiles ? heavyFiles : heavyFiles.slice(0, limit);

if (selectedFiles.length === 0) {
  console.log('No files over 300 KB were found in the selected bucket.');
  process.exit(0);
}

let completed = 0;
let skipped = 0;
let failed = 0;

for (const file of selectedFiles) {
  const name = file.name;
  const ext = (name.split('.').pop() || '').toLowerCase();
  const backupPath = join(backupDirectory, name.replace(/[\\/]/g, '_'));

  try {
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from(bucketName)
      .download(name);

    if (downloadError) {
      throw new Error(`Unable to download ${name}: ${downloadError.message}`);
    }

    const originalBuffer = Buffer.from(await downloadData.arrayBuffer());
    writeFileSync(backupPath, originalBuffer);

    let transformed = sharp(originalBuffer).rotate().resize({
      width: 1280,
      withoutEnlargement: true,
    });

    let contentType = 'image/webp';

    if (ext === 'png') {
      transformed = transformed.png({ palette: true, quality: 75, compressionLevel: 9 });
      contentType = 'image/png';
    } else if (ext === 'jpg' || ext === 'jpeg') {
      transformed = transformed.jpeg({ quality: 75, mozjpeg: true });
      contentType = 'image/jpeg';
    } else {
      transformed = transformed.webp({ quality: 75 });
      contentType = 'image/webp';
    }

    const outputBuffer = await transformed.toBuffer();

    if (outputBuffer.length >= originalBuffer.length) {
      console.log(`kept (not smaller) ${name}`);
      skipped += 1;
      continue;
    }

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(name, outputBuffer, {
        upsert: true,
        contentType,
        cacheControl: '31536000',
      });

    if (uploadError) {
      throw new Error(`Unable to upload ${name}: ${uploadError.message}`);
    }

    console.log(`${name}: ${Math.round(originalBuffer.length / 1024)}KB -> ${Math.round(outputBuffer.length / 1024)}KB`);
    completed += 1;
  } catch (error) {
    failed += 1;
    console.error(`✗ ${name}: ${error.message}`);
  }
}

console.log(`\nProcessed ${completed} file(s); skipped ${skipped}; failed ${failed}.`);

const { data: filesAfter, error: listAfterError } = await supabase.storage.from(bucketName).list('', { limit: 1000 });
if (!listAfterError) {
  const afterCount = (filesAfter ?? []).filter((file) => (file.metadata?.size ?? 0) > 300 * 1024).length;
  console.log(`After: files over 300 KB = ${afterCount}`);
  console.log(`Reduction: ${beforeCount - afterCount} file(s)`);
}

if (failed > 0) {
  process.exitCode = 1;
}

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const cacheControl = process.env.STORAGE_CACHE_CONTROL || '31536000';
const shouldApply = process.argv.includes('--apply');
const buckets = process.argv.slice(2).filter((value) => !value.startsWith('--'));
const targetBuckets = buckets.length > 0 ? buckets : ['property-images', 'submission-photos'];

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Set SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY before running this script.');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function contentTypeFor(path) {
  const extension = path.split('.').pop()?.toLowerCase();
  return extension === 'png' ? 'image/png' : extension === 'jpg' || extension === 'jpeg' ? 'image/jpeg' : 'image/webp';
}

async function listFiles(bucket, prefix = '') {
  const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit: 1000, offset: 0 });
  if (error) throw error;

  const files = [];
  for (const item of data || []) {
    const path = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.id) {
      files.push(path);
    } else {
      files.push(...(await listFiles(bucket, path)));
    }
  }
  return files;
}

for (const bucket of targetBuckets) {
  const files = await listFiles(bucket);
  console.log(`${bucket}: ${files.length} file(s) found`);

  for (const path of files) {
    if (!shouldApply) {
      console.log(`dry-run: ${bucket}/${path}`);
      continue;
    }

    const { data: file, error: downloadError } = await supabase.storage.from(bucket).download(path);
    if (downloadError) throw downloadError;

    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl,
      contentType: contentTypeFor(path),
      upsert: true,
    });
    if (uploadError) throw uploadError;

    console.log(`updated: ${bucket}/${path}`);
  }
}

if (!shouldApply) {
  console.log('Dry run only. Add --apply to download and re-upload these objects with cache metadata.');
}
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const timeout = AbortSignal.timeout(30_000);
const { data: properties, error } = await supabase
  .from('properties')
  .select('id,title,cover_image_url')
  .not('cover_image_url', 'is', 'null')
  .limit(20);

if (error) {
  throw new Error(error.message);
}

for (const property of properties) {
  const url = property.cover_image_url;
  const publicResponse = url
    ? await fetch(url, { signal: timeout }).then(async (response) => ({
        status: response.status,
        size: (await response.arrayBuffer()).byteLength,
        contentType: response.headers.get('content-type'),
      }))
    : null;

  console.log(JSON.stringify({
    id: property.id,
    title: property.title,
    coverImageUrl: url,
    publicStatus: publicResponse?.status,
    publicSize: publicResponse?.size,
    contentType: publicResponse?.contentType,
  }));
}

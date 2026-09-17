import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const maxBytes = 5 * 1024 * 1024;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function getEnv(name: string) {
  return (globalThis as any).process?.env?.[name] || '';
}

function cleanFolder(value: string) {
  return value.replace(/[^a-z0-9/_-]/gi, '').replace(/^\/+|\/+$/g, '');
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const contentType = request.headers.get('content-type') || '';
  const uploadFolder = cleanFolder(request.headers.get('x-upload-folder') || '');
  const uploadScope = request.headers.get('x-upload-scope') || 'public-submission';

  if (!allowedTypes.has(contentType) || !uploadFolder) {
    return json({ error: 'Only JPEG, PNG, and WebP image uploads are allowed.' }, 415);
  }

  if (uploadScope === 'admin') {
    const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL');
    const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY');
    const authorization = request.headers.get('authorization');

    if (!supabaseUrl || !supabaseAnonKey || !authorization) {
      return json({ error: 'Admin authentication is required.' }, 401);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase.auth.getUser(authorization.replace(/^Bearer\s+/i, ''));
    if (error || !data.user) return json({ error: 'Invalid admin session.' }, 401);
  } else if (uploadScope !== 'public-submission' || uploadFolder !== 'submission-photos') {
    return json({ error: 'Invalid upload scope.' }, 403);
  }

  const body = Buffer.from(await request.arrayBuffer());
  if (body.byteLength === 0 || body.byteLength > maxBytes) {
    return json({ error: 'Image must be between 1 byte and 5 MB.' }, 413);
  }

  const endpoint = getEnv('R2_ENDPOINT').replace(/\/+$/, '') ||
    (getEnv('R2_ACCOUNT_ID') ? `https://${getEnv('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com` : '');
  const accessKeyId = getEnv('R2_ACCESS_KEY_ID');
  const secretAccessKey = getEnv('R2_SECRET_ACCESS_KEY');
  const bucket = getEnv('R2_BUCKET_NAME');
  const publicBaseUrl = getEnv('R2_PUBLIC_BASE_URL').replace(/\/+$/, '');

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket || !publicBaseUrl) {
    return json({ error: 'R2 upload service is not configured.' }, 503);
  }

  const extension = contentType === 'image/png' ? 'png' : contentType === 'image/jpeg' ? 'jpg' : 'webp';
  const key = `${uploadFolder}/${crypto.randomUUID()}.${extension}`;
  const client = new S3Client({
    region: 'auto',
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });

  try {
    await client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    }));

    const publicUrl = `${publicBaseUrl}/${key}`;
    const verification = await fetch(publicUrl, { method: 'HEAD' });
    if (!verification.ok) {
      return json({ error: 'R2 upload could not be verified.' }, 502);
    }

    return json({ url: publicUrl, key });
  } catch (error) {
    console.error('R2 image upload failed:', error);
    return json({ error: 'R2 image upload failed.' }, 502);
  }
}

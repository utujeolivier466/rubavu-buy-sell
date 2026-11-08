// backfill-thumbs.mjs — npm i @supabase/supabase-js sharp
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import crypto from 'crypto'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Set SUPABASE_URL (or VITE_SUPABASE_URL) and SERVICE_ROLE_KEY (or SUPABASE_SERVICE_ROLE_KEY) before running the backfill.')
}

const sb = createClient(supabaseUrl, serviceRoleKey)
const BUCKET = 'property-images'
const LIMIT = Number(process.env.LIMIT || 3)

const { data: rows, error } = await sb.from('properties')
  .select('id, cover_image_url')
  .is('cover_thumb_url', null)
  .not('cover_image_url', 'is', null)
  .order('created_at', { ascending: false })
  .limit(LIMIT)

if (error) throw error

for (const r of rows ?? []) {
  const name = r.cover_image_url.split('/property-images/')[1]
  if (!name) {
    console.log('skip', r.id)
    continue
  }

  const { data: blob, error: dErr } = await sb.storage.from(BUCKET).download(name)
  if (dErr) {
    console.log('skip', r.id, dErr.message)
    continue
  }

  const out = await sharp(Buffer.from(await blob.arrayBuffer()))
    .rotate()
    .resize({ width: 400, withoutEnlargement: true })
    .webp({ quality: 60 })
    .toBuffer()

  const thumbName = `thumb_${crypto.randomUUID()}.webp`
  const { error: uErr } = await sb.storage.from(BUCKET)
    .upload(thumbName, out, { contentType: 'image/webp', cacheControl: '31536000' })

  if (uErr) {
    console.log('FAIL', r.id, uErr.message)
    continue
  }

  const url = sb.storage.from(BUCKET).getPublicUrl(thumbName).data.publicUrl
  const { error: pErr } = await sb.from('properties').update({ cover_thumb_url: url }).eq('id', r.id)
  console.log(pErr ? `FAIL row ${r.id}: ${pErr.message}` : `${r.id}: ${Math.round(out.length / 1024)} KB`)
}

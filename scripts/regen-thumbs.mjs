// Rebuild every listing's card thumbnail at higher quality.
// Uploads NEW files (new names, so old 1-year browser/CDN caches can't serve the blurry ones)
// and points properties.cover_thumb_url at them. Resumable: finished ids are kept in thumb-regen-done.json.
// Usage (PowerShell):  $env:LIMIT=3; node regen-thumbs.mjs      then      $env:LIMIT=1000; node regen-thumbs.mjs
// Optional: $env:WIDTH=720; $env:QUALITY=78
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import crypto from 'crypto'
import fs from 'fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env') })

const URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) { console.error('Set SUPABASE_URL (or VITE_SUPABASE_URL) and SERVICE_ROLE_KEY (or SUPABASE_SERVICE_ROLE_KEY) first.'); process.exit(1) }

const sb = createClient(URL, KEY)
const BUCKET = 'property-images'
const LIMIT = Number(process.env.LIMIT || 3)
const WIDTH = Number(process.env.WIDTH || 720)
const QUALITY = Number(process.env.QUALITY || 78)
const STATE = './thumb-regen-done.json'
const done = new Set(fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : [])

const { data: rows, error } = await sb.from('properties')
  .select('id, cover_image_url')
  .not('cover_image_url', 'is', null)
  .order('created_at', { ascending: false })
  .limit(1000)
if (error) throw error

const todo = rows.filter(r => !done.has(r.id)).slice(0, LIMIT)
console.log(`${rows.length} listings, ${done.size} already done, ${todo.length} this run (${WIDTH}px, q${QUALITY})`)

let total = 0, count = 0
for (const r of todo) {
  const name = r.cover_image_url.split('/property-images/')[1]
  if (!name) { console.log('SKIP (unrecognised url)', r.id); continue }
  const { data: blob, error: dErr } = await sb.storage.from(BUCKET).download(name)
  if (dErr) { console.log('SKIP (download failed)', r.id, dErr.message); continue }

  const out = await sharp(Buffer.from(await blob.arrayBuffer()))
    .rotate()
    .resize({ width: WIDTH, withoutEnlargement: true, kernel: 'lanczos3' })
    .sharpen({ sigma: 0.6 })
    .webp({ quality: QUALITY, effort: 5, smartSubsample: true })
    .toBuffer()

  const thumbName = `thumb_${crypto.randomUUID()}.webp`
  const { error: uErr } = await sb.storage.from(BUCKET)
    .upload(thumbName, out, { contentType: 'image/webp', cacheControl: '31536000' })
  if (uErr) { console.log('FAIL upload', r.id, uErr.message); continue }

  const url = sb.storage.from(BUCKET).getPublicUrl(thumbName).data.publicUrl
  const { error: pErr } = await sb.from('properties').update({ cover_thumb_url: url }).eq('id', r.id)
  if (pErr) { console.log('FAIL row', r.id, pErr.message); continue }

  done.add(r.id)
  fs.writeFileSync(STATE, JSON.stringify([...done]))
  total += out.length; count++
  console.log(`${r.id}: ${Math.round(out.length / 1024)} KB`)
}
if (count) console.log(`\nDone. ${count} thumbnails, average ${Math.round(total / count / 1024)} KB`)

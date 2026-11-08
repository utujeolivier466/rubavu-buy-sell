// fix-all.mjs  —  npm i @supabase/supabase-js sharp
import fs from 'fs'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Set SUPABASE_URL (or VITE_SUPABASE_URL) and SERVICE_ROLE_KEY (or SUPABASE_SERVICE_ROLE_KEY) before running the fix.')
}

const sb = createClient(supabaseUrl, serviceRoleKey)
const BUCKET = 'property-images'
const LIMIT = Number.parseInt(process.env.LIMIT || process.env.MAX_FILES || '1000', 10)

if (!Number.isFinite(LIMIT) || LIMIT <= 0) {
  throw new Error('Image processing limit must be a positive number. Default is 1000.')
}

fs.mkdirSync('./backup', { recursive: true })

const { data: files, error } = await sb.storage.from(BUCKET).list('', { limit: 1000 })
if (error) throw error
const heavy = files
  .filter(f => (f.metadata?.size ?? 0) > 250 * 1024 && !f.name.startsWith('thumb_'))
  .slice(0, LIMIT)

for (const f of heavy) {
  const ext = f.name.split('.').pop().toLowerCase()
  const { data: blob, error: dErr } = await sb.storage.from(BUCKET).download(f.name)
  if (dErr) { console.log('skip', f.name, dErr.message); continue }
  const input = Buffer.from(await blob.arrayBuffer())
  fs.writeFileSync(`./backup/${f.name}`, input)

  let img = sharp(input).rotate().resize({ width: 1200, withoutEnlargement: true })
  let type
  if (ext === 'png') { img = img.png({ palette: true, quality: 70, compressionLevel: 9 }); type = 'image/png' }
  else if (ext === 'jpg' || ext === 'jpeg') { img = img.jpeg({ quality: 70, mozjpeg: true }); type = 'image/jpeg' }
  else { img = img.webp({ quality: 70 }); type = 'image/webp' }
  const out = await img.toBuffer()

  if (out.length >= input.length) { console.log('kept', f.name); continue }
  const { error: uErr } = await sb.storage.from(BUCKET).upload(f.name, out, {
    upsert: true, contentType: type, cacheControl: '31536000',
  })
  console.log(uErr ? `FAIL ${f.name}: ${uErr.message}` : `${f.name}: ${Math.round(input.length/1024)}KB -> ${Math.round(out.length/1024)}KB`)
}
import { ImageResponse } from '@vercel/og'

export const config = {
  runtime: 'edge',
}

const SITE_NAME = 'Rubavu Buy and Sell'
const SITE_DOMAIN = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://rubavu-buy-sell.vercel.app')

async function fetchProperty(slug: string) {
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!SUPABASE_URL || !SERVICE_KEY) return null

  const url = `${SUPABASE_URL}/rest/v1/properties?select=title,slug,cover_image_url,image_urls,location_text,price,currency&slug=eq.${encodeURIComponent(slug)}`
  const res = await fetch(url, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      Accept: 'application/json',
    },
  })

  if (!res.ok) return null
  const data = await res.json()
  return (data && data[0]) || null
}

export default async function handler(req: Request) {
  try {
    const url = new URL(req.url)
    const parts = url.pathname.split('/')
    const slug = parts[parts.length - 1]
    if (!slug) return new Response('Missing slug', { status: 400 })

    const property = await fetchProperty(slug)
    const title = property?.title || 'Property Listing'
    const location = property?.location_text || 'Rubavu, Rwanda'
    const price = property?.price ? `${property.currency || ''} ${Number(property.price).toLocaleString()}` : ''
    const imageUrl = property?.cover_image_url || (property?.image_urls && property.image_urls[0]) || null

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: '1200px',
            height: '630px',
            background: 'linear-gradient(135deg, #0D4F2A 0%, #D56000 100%)',
            padding: '48px',
            boxSizing: 'border-box',
            flexDirection: 'column',
            justifyContent: 'space-between',
            color: 'white',
            fontFamily: 'Inter, system-ui, Arial, sans-serif',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: 28 }}>{SITE_NAME}</div>
            <div style={{ background: 'rgba(255,255,255,0.12)', padding: '8px 12px', borderRadius: 999, fontWeight: 700 }}>
              Property Listing
            </div>
          </div>

          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.05 }}>{title}</div>
              <div style={{ marginTop: 12, fontSize: 24, opacity: 0.95 }}>{location} {price ? `• ${price}` : ''}</div>
            </div>
            {imageUrl && (
              <div style={{ width: 420, height: 280, borderRadius: 20, overflow: 'hidden', border: '4px solid rgba(255,255,255,0.18)' }}>
                <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 20 }}>
            <span>View property details</span>
            <span>{SITE_DOMAIN.replace(/^https?:\/\//, '')}</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (err) {
    console.error('OG generation error', err)
    return new Response('Failed to generate image', { status: 500 })
  }
}

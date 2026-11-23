import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const fetchWithStorageUploadTimeout = (input, init) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  const isStorageWrite = init?.method === 'POST' || init?.method === 'PUT'
  if (!isStorageWrite || !url.includes('/storage/v1/object/')) {
    return fetch(input, init)
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 90000)

  return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(timeoutId))
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      global: { fetch: fetchWithStorageUploadTimeout },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null
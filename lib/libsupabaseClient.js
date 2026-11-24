import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const fetchWithStorageUploadTimeout = (input, init) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  const method = (init?.method || (typeof input === 'string' || input instanceof URL ? '' : input.method)).toUpperCase()
  const isStorageWrite = (method === 'POST' || method === 'PUT') && url.includes('/storage/v1/object/')
  const isSubmissionInsert = method === 'POST' && url.includes('/rest/v1/property_submissions')
  if (!isStorageWrite && !isSubmissionInsert) {
    return fetch(input, init)
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), isStorageWrite ? 90000 : 30000)
  const requestSignal =
    init?.signal || (typeof Request !== 'undefined' && input instanceof Request ? input.signal : undefined)
  const abortRequest = () => controller.abort()
  requestSignal?.addEventListener('abort', abortRequest, { once: true })
  if (requestSignal?.aborted) controller.abort()

  return fetch(input, { ...init, signal: controller.signal }).finally(() => {
    clearTimeout(timeoutId)
    requestSignal?.removeEventListener('abort', abortRequest)
  })
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
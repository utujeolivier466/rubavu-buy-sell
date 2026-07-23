// Supabase Edge Function: get-admin-role
// Deploy with: supabase functions deploy get-admin-role

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function normalizeRole(value: unknown): string | null {
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    if (normalized === 'owner' || normalized === 'staff') return normalized;
  }
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Missing authorization' }, 401);

    const jwt = authHeader.replace('Bearer ', '');
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: userData, error: userError } = await adminClient.auth.getUser(jwt);
    if (userError || !userData.user) {
      return json({ error: 'Invalid session' }, 401);
    }

    const metadataRole = normalizeRole(userData.user?.user_metadata?.role ?? userData.user?.app_metadata?.role);
    if (metadataRole) {
      return json({ role: metadataRole });
    }

    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .maybeSingle();

    if (profileError) {
      console.warn('Could not load profile role:', profileError);
      return json({ role: null });
    }

    return json({ role: normalizeRole(profile?.role) });
  } catch (err) {
    console.error('get-admin-role error:', err);
    return json({ error: 'Unexpected error' }, 500);
  }
});

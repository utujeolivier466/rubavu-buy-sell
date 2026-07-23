// @ts-nocheck
// Supabase Edge Function: remove-admin-user
// Deploy with: supabase functions deploy remove-admin-user

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @deno-types="https://esm.sh/@supabase/supabase-js@2?dts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: userData, error: userError } = await adminClient.auth.getUser(token);
    if (userError || !userData.user) {
      return json({ error: 'Invalid session' }, 401);
    }

    const metadataRole = normalizeRole(userData.user?.user_metadata?.role ?? userData.user?.app_metadata?.role);
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .maybeSingle();

    const profileRole = normalizeRole(profile?.role);
    if (profileError) {
      console.warn('Could not load profile role for remove-admin-user:', profileError);
    }

    if (metadataRole !== 'owner' && profileRole !== 'owner') {
      return json({ error: 'Only owners can remove admin users' }, 403);
    }

    const { userId } = await req.json();
    if (!userId) return json({ error: 'userId is required' }, 400);

    if (userId === userData.user.id) {
      return json({ error: "You can't remove your own account" }, 400);
    }

    const { error } = await adminClient.auth.admin.deleteUser(userId);
    if (error) {
      console.error('Remove user failed:', error);
      return json({ error: error.message }, 500);
    }

    return json({ success: true });
  } catch (err) {
    console.error('remove-admin-user error:', err);
    return json({ error: 'Unexpected error' }, 500);
  }
});

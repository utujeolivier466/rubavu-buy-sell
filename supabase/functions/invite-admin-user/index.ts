// Supabase Edge Function: invite-admin-user
// Deploy with: supabase functions deploy invite-admin-user

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SITE_URL = Deno.env.get('SITE_URL') || 'https://rubavu-buy-sell.vercel.app';

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

    // Verify caller identity using access token
    const { data: userData, error: userError } = await adminClient.auth.getUser(jwt);
    if (userError || !userData.user) {
      return json({ error: 'Invalid session' }, 401);
    }

    // Verify caller is an owner — prefer auth metadata, then fall back to profiles
    const metadataRole = normalizeRole(userData.user?.user_metadata?.role ?? userData.user?.app_metadata?.role);
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .maybeSingle();

    const profileRole = normalizeRole(profile?.role);
    if (profileError) {
      console.warn('Could not load profile role for invite-admin-user:', profileError);
    }

    if (metadataRole !== 'owner' && profileRole !== 'owner') {
      return json({ error: 'Only owners can invite new admin users' }, 403);
    }

    const { email } = await req.json();
    if (!email) return json({ error: 'Email is required' }, 400);

    const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${SITE_URL}/admin/reset-password`,
    });

    if (error) {
      console.error('Invite failed:', error);
      return json({ error: error.message }, 500);
    }

    // data.user may be undefined in some Supabase responses; guard access
    const invitedUser = data?.user ? { id: data.user.id, email: data.user.email } : null;
    return json({ success: true, user: invitedUser });
  } catch (err) {
    console.error('invite-admin-user error:', err);
    return json({ error: 'Unexpected error' }, 500);
  }
});
